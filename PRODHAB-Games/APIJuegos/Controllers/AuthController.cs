using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Helpers;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

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

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequestDto request)
        {
            try
            {
                if (request == null)
                    return BadRequest(new { message = "Solicitud inválida" });

                if (string.IsNullOrWhiteSpace(request.Username))
                    return BadRequest(new { message = "El usuario es obligatorio" });

                if (string.IsNullOrEmpty(request.Password))
                    return BadRequest(new { message = "La contraseña es obligatoria" });

                var usuario = _context
                    .Usuarios.Include(u => u.Rol)
                    .FirstOrDefault(u => u.Correo == request.Username);

                if (usuario == null)
                    return Unauthorized(new { message = "Usuario o contraseña inválidos" });

                // Validar contraseña
                var saltBytes = Convert.FromBase64String(usuario.Salt ?? "");
                bool credentialsAreValid = PasswordHelper.VerifyPassword(
                    request.Password,
                    saltBytes,
                    usuario.Clave ?? Array.Empty<byte>()
                );

                if (!credentialsAreValid)
                    return Unauthorized(new { message = "Usuario o contraseña inválidos" });

                if (!usuario.Activo)
                    return Unauthorized(
                        new { message = "Usuario inactivo, contacte al administrador" }
                    );

                var token = GenerateJwtToken(usuario);

                Response.Cookies.Append(
                    "jwt_admin_juegos_prodhab",
                    token,
                    new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true,
                        SameSite = SameSiteMode.None,
                    }
                );

                return Ok(
                    new { message = "Login exitoso", rol = usuario.Rol?.Nombre ?? "sin-rol" }
                );
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Error interno en el servidor" });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete(
                "jwt_admin_juegos_prodhab",
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                }
            );

            return Ok(new { message = "Logout ok" });
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            var keyString =
                _config["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "Jwt:Key no configurado en appsettings.json"
                );

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, usuario.Correo),
                new Claim(ClaimTypes.Role, usuario.Rol?.Nombre ?? "SinRol"),
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
