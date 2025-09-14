using APIJuegos.Data;
using APIJuegos.Data.Helpers;
using APIJuegos.Data.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    [EnableCors("FrontWithCookies")]


    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly PracticaJuegosUcrContext _context;

        public AuthController(IConfiguration config, PracticaJuegosUcrContext context)
        {
            _config = config;
            _context = context;

        }

        public record LoginRequest(string Username, string Password);
        public record RegisterRequest(string Correo, string Password, int RolId);

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Correo == req.Correo))
                return BadRequest(new { message = "Correo ya registrado" });

            var salt = PasswordHelper.GenerateSalt();
            var hash = PasswordHelper.HashPassword(req.Password, salt); // byte[]

            var user = new Usuario
            {
                Correo = req.Correo,
                Clave = hash,
                Salt = salt,
                RolId = req.RolId, // 1=admin, 2=usuario
                FechaCreacion = DateTime.UtcNow
            };

            _context.Usuarios.Add(user);
            await _context.SaveChangesAsync();
            return Created("", new { message = "Usuario creado" });
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var usuario = _context.Usuarios.Include(u => u.Rol).FirstOrDefault(u => u.Correo == request.Username);
            
            if (usuario == null) return Unauthorized(new { message = "Correo no encontrado" });

            var hashedInput = PasswordHelper.HashPassword(request.Password, usuario.Salt);

            if (!hashedInput.SequenceEqual(usuario.Clave))
                return Unauthorized(new { message = "Contraseña incorrecta" });

            var token = GenerateJwtToken(usuario);

            // 🔹 Guardar JWT en cookie
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,   //cambiar si se usa el http
                SameSite = SameSiteMode.None
            });

            return Ok(new { message = "Login exitoso" });
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.None
            });
            return Ok(new { message = "Logout ok" });
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, usuario.Correo),
                new Claim(ClaimTypes.Role, usuario.Rol.Nombre) // si tienes roles
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(4),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
