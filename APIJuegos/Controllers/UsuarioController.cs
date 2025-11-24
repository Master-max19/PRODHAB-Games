using System.Security.Claims;
using APIJuegos.Data;
using APIJuegos.Enums;
using APIJuegos.Helpers;
using APIJuegos.Modelos;
using APIJuegos.Services;
//John--------------------------------------------------
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("FrontWithCookies")]
    [Authorize(Roles = "Administrador")]
    public class UsuarioController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;
        private readonly IEmailService _emailService;

        public UsuarioController(JuegosProdhabContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        [Authorize]
        public IActionResult Get()
        {
            var usuarios = _context
                .Usuarios.Include(u => u.Rol)
                .Select(u => new
                {
                    u.Correo,
                    Estado = u.Activo,
                    Rol = u.Rol != null ? u.Rol.Nombre : null,
                    u.FechaCreacion,
                })
                .ToList();

            return Ok(usuarios);
        }

        [HttpGet("{idUsuario}")]
        public ActionResult<Usuario> GetById(int idUsuario)
        {
            var usuario = _context.Usuarios.Find(idUsuario);
            if (usuario == null)
                return NotFound();
            return usuario;
        }

        [HttpGet("correo/{correo}")]
        public async Task<ActionResult<Usuario>> GetByCorreo(string correo)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo);

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            return Ok(usuario);
        }

        [HttpPost]
        public ActionResult<Usuario> Create(Usuario nuevoUsuario)
        {
            if (nuevoUsuario == null || string.IsNullOrWhiteSpace(nuevoUsuario.Correo))
                return BadRequest("La usuarios debe tener un correo.");

            _context.Usuarios.Add(nuevoUsuario);
            _context.SaveChanges();

            return CreatedAtAction(
                nameof(GetById),
                new { idUsuario = nuevoUsuario.IdUsuario },
                nuevoUsuario
            );
        }

        [HttpPut("{idUsuario}")]
        public ActionResult Update(int id, Usuario usuarioActualizado)
        {
            var usuario = _context.Usuarios.Find(id);
            if (usuario == null)
                return NotFound();

            usuario.Clave = usuarioActualizado.Clave;
            usuario.IdRol = usuarioActualizado.IdRol;
            usuario.Activo = usuarioActualizado.Activo;

            _context.SaveChanges();
            return Ok(usuario);
        }

        [HttpDelete("{correo}")] // correo viene en la URL
        public ActionResult DeleteByEmail(string correo)
        {
            var correoLogueado = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (correoLogueado == null)
                return Unauthorized(new { message = "Token inválido" });

            // Evitar que el admin se desactive a sí mismo
            if (correoLogueado.ToLower() == correo.ToLower())
                return BadRequest(new { message = "No puedes eliminar tu propia cuenta" });

            if (string.IsNullOrEmpty(correo))
                return BadRequest("El correo es obligatorio");

            var usuario = _context.Usuarios.FirstOrDefault(u => u.Correo == correo);
            if (usuario == null)
                return NotFound();

            _context.Usuarios.Remove(usuario);
            _context.SaveChanges();

            return NoContent();
        }

        public record RegisterRequest(string Correo, string Password, int IdRol, bool Activo);

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Correo) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { message = "Correo y contraseña son requeridos" });

            var existingUser = await _context.Usuarios.FirstOrDefaultAsync(u =>
                u.Correo == req.Correo
            );
            var rol = await _context.Roles.FindAsync(req.IdRol);
            if (rol == null)
                return BadRequest(new { message = "El rol especificado no existe" });

            if (existingUser != null)
            {
                if (existingUser.Activo)
                {
                    return BadRequest(
                        new { message = "Ya existe un usuario activo con ese correo" }
                    );
                }
                else
                {
                    var salt = PasswordHelper.GenerateSalt();
                    var hash = PasswordHelper.HashPassword(req.Password, salt);
                    existingUser.Salt = Convert.ToBase64String(salt);
                    existingUser.Clave = hash;

                    existingUser.IdRol = req.IdRol;
                    existingUser.Activo = true;

                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Usuario reactivado correctamente" });
                }
            }

            var nuevoSalt = PasswordHelper.GenerateSalt();
            var nuevoHash = PasswordHelper.HashPassword(req.Password, nuevoSalt);

            var user = new Usuario
            {
                Correo = req.Correo,
                Clave = nuevoHash,
                Salt = Convert.ToBase64String(nuevoSalt),
                IdRol = req.IdRol,
                FechaCreacion = DateTime.UtcNow,
                Activo = req.Activo,
            };

            _context.Usuarios.Add(user);
            await _context.SaveChangesAsync();

            return Created("", new { message = "Usuario creado" });
        }

        [HttpPut("desactivar/{correo}")]
        public async Task<IActionResult> DesactivarUsuario(string correo)
        {
            var correoLogueado = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (correoLogueado == null)
                return Unauthorized(new { message = "Token inválido" });

            if (correoLogueado.ToLower() == correo.ToLower())
                return BadRequest(new { message = "No puedes desactivar tu propia cuenta" });

            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u =>
                u.Correo.ToLower() == correo.ToLower()
            );

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            if (!usuario.Activo)
                return BadRequest(new { message = "El usuario ya está desactivado" });

            usuario.Activo = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario desactivado correctamente" });
        }

        [HttpPut("activar/{correo}")]
        public async Task<IActionResult> ActivarUsuario(string correo)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u =>
                u.Correo.ToLower() == correo.ToLower()
            );

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            if (usuario.Activo)
                return BadRequest(new { message = "El usuario ya está activo" });

            usuario.Activo = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario activado correctamente" });
        }

        public record CambiarClaveRequest(string NuevaClave);

        [HttpPut("actualizar-clave/{correo}")]
        public async Task<IActionResult> ActualizarClave(
            string correo,
            [FromBody] CambiarClaveRequest request
        )
        {
            var correoLogueado = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            if (correoLogueado == null)
                return Unauthorized(new { message = "Token inválido" });

            var usuario = await _context
                .Usuarios.Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo.ToLower());
            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            var usuarioLogueado = await _context
                .Usuarios.Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Correo.ToLower() == correoLogueado.ToLower());
            if (usuarioLogueado == null)
                return Unauthorized(new { message = "Usuario logueado no encontrado" });

            if (usuarioLogueado.IdRol == (int)TipoRolAdmin.JuegoAdmin)
            {
                return StatusCode(
                    403,
                    new { message = "No tienes permisos para cambiar contraseñas" }
                );
            }

            // Administrador (IdRol == 1)
            if (usuario.IdRol == (int)TipoRolAdmin.SuperAdmin)
            {
                if (usuario.Correo?.ToLower() != correoLogueado?.ToLower())
                    return StatusCode(
                        403,
                        new { message = "No puedes cambiar la contraseña de otro administrador" }
                    );
            }
            else
            {
                // Si no es administrador, solo un admin puede cambiar la contraseña de otro usuario
                if (
                    usuarioLogueado.IdRol != (int)TipoRolAdmin.SuperAdmin
                    && usuario.Correo?.ToLower() != correoLogueado?.ToLower()
                )
                {
                    return BadRequest(
                        new
                        {
                            message = "Solo un administrador puede cambiar la contraseña de otro usuario",
                        }
                    );
                }
            }

            var nuevoSalt = PasswordHelper.GenerateSalt();
            var nuevoHash = PasswordHelper.HashPassword(request.NuevaClave ?? "", nuevoSalt);

            usuario.Salt = Convert.ToBase64String(nuevoSalt);
            usuario.Clave = nuevoHash;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Clave actualizada correctamente" });
        }

        public record ResetPasswordRequest(string Correo, string Codigo, string NuevaClave);

        [AllowAnonymous]
        [EnableCors("AllowAll")]
        [HttpPost("restablecer")]
        public async Task<IActionResult> RestablecerClave([FromBody] ResetPasswordRequest req)
        {
            if (
                string.IsNullOrWhiteSpace(req.Correo)
                || string.IsNullOrWhiteSpace(req.Codigo)
                || string.IsNullOrWhiteSpace(req.NuevaClave)
            )
            {
                return BadRequest(
                    new { mensaje = "Correo, código y nueva clave son obligatorios" }
                );
            }

            // Buscar usuario
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u =>
                u.Correo.ToLower() == req.Correo.ToLower()
            );

            if (usuario == null)
                return NotFound(new { mensaje = "Usuario no existe" });

            // Buscar el código activo más reciente
            var codigoDb = await _context
                .CodigosVerificaciones.Where(c =>
                    c.IdUsuario == usuario.IdUsuario && c.Codigo == req.Codigo && c.Activo
                )
                .OrderByDescending(c => c.IdCodigoVerificacion)
                .FirstOrDefaultAsync();

            if (codigoDb == null)
                return BadRequest(new { mensaje = "Código inválido o ya utilizado" });

            // Verificar expiración
            if (codigoDb.Expiracion < DateTime.UtcNow)
            {
                codigoDb.Activo = false;
                await _context.SaveChangesAsync();
                return BadRequest(new { mensaje = "El código ha expirado" });
            }

            // Cambiar contraseña
            var nuevoSalt = PasswordHelper.GenerateSalt();
            var nuevoHash = PasswordHelper.HashPassword(req.NuevaClave, nuevoSalt);

            usuario.Salt = Convert.ToBase64String(nuevoSalt);
            usuario.Clave = nuevoHash;

            // Desactivar el código (solo se usa una vez)
            codigoDb.Activo = false;

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Contraseña actualizada correctamente" });
        }

        [AllowAnonymous]
        [EnableCors("AllowAll")]
        [HttpPost("solicitar/{correo}")]
        public async Task<IActionResult> SolicitarCodigo(string correo)
        {
            // Buscar usuario por correo
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u =>
                u.Correo.ToLower() == correo.ToLower()
            );

            if (usuario == null)
                return NotFound(new { mensaje = "Usuario no existe" });

            // Generar código de 6 dígitos
            var codigo = new Random().Next(100000, 999999).ToString();

            var nuevoCodigo = new CodigoVerificacion
            {
                Codigo = codigo,
                Expiracion = DateTime.UtcNow.AddMinutes(10),
                Activo = true,
                IdUsuario = usuario.IdUsuario,
            };

            _context.CodigosVerificaciones.Add(nuevoCodigo);
            await _context.SaveChangesAsync();

            // Enviar correo con el código
            await _emailService.SendEmailAsync(
                correo,
                "Código de verificación",
                GenerarHtmlCodigo(codigo)
            );

            return Ok(new { mensaje = "Código enviado exitosamente" });
        }

        private string GenerarHtmlCodigo(string codigo)
        {
            return $@"
                    <div style='font-family: Arial, sans-serif; color: #333; text-align: center'>
                    <h2 style='font-weight: 600; margin-bottom: 10px'>Código de verificación</h2>

                    <p style='font-size: 15px; margin: 0 0 15px 0'>
                        Usa el siguiente código para continuar:
                    </p>

                    <div
                        style='
                        display: inline-block;
                        padding: 12px 20px;
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 4px;
                        border-radius: 8px;
                        border: 1px solid #ddd;
                        background: #1e355e;
                        color: #ffffff;
                        margin-bottom: 20px;
                        '
                    >
                        {codigo}
                    </div>

                    <p style='font-size: 14px; color: #777; margin-top: 10px'>
                        Este código expira en <strong>10 minutos</strong>.
                    </p>
                    </div>";
        }
    }
}
