using APIJuegos.Data;
using APIJuegos.Data.Helpers;
using APIJuegos.Data.Modelos;
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
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly PracticaJuegosUcrContext _context;

        public AuthController(IConfiguration config, PracticaJuegosUcrContext context)
        {
            _config = config;
            _context = context;

        }


     [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var usuario = _context.Usuarios.Include(u => u.Rol).FirstOrDefault(u => u.Correo == request.Username);
            
            if (usuario == null) return Unauthorized(new { message = "Usuario no encontrado" });

            var hashedInput = PasswordHelper.HashPassword(request.Password, usuario.Salt);

            if (!hashedInput.SequenceEqual(usuario.Clave))
                return Unauthorized(new { message = "Contraseña incorrecta" });

            var token = GenerateJwtToken(usuario);

            // 🔹 Guardar JWT en cookie
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Ok(new { message = "Login exitoso" });
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");
            return Ok(new { message = "Sesión cerrada" });
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
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
