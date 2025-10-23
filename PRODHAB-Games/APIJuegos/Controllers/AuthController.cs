using APIJuegos.Data;
using APIJuegos.Helpers;
using APIJuegos.Modelos;
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
        private readonly JuegosProdhabContext _context;

        public AuthController(IConfiguration config, JuegosProdhabContext context)
        {
            _config = config;
            _context = context;

        }

        public record LoginRequest(string Username, string Password);


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var usuario = _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefault(u => u.Correo == request.Username);

            if (usuario == null)
                return Unauthorized(new { message = "Correo no encontrado" });

            if (!usuario.Activo)
                return Unauthorized(new { message = "Usuario inactivo, contacte al administrador" });


            var saltBytes = Convert.FromBase64String(usuario.Salt);
            bool isValid = PasswordHelper.VerifyPassword(request.Password, saltBytes, usuario.Clave);

            if (!isValid)
                return Unauthorized(new { message = "Contraseña incorrecta" });


            var token = GenerateJwtToken(usuario);

            // 🔹 Guardar JWT en cookie
            Response.Cookies.Append("jwt_admin_juegos_prodhab", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,   // cambiar si se usa http
                SameSite = SameSiteMode.None
            });

            return Ok(new { message = "Login exitoso"  });
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt_admin_juegos_prodhab", new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.None
            });
            return Ok(new { message = "Logout ok" });
        }

        private string GenerateJwtToken(Usuarios usuario)
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
