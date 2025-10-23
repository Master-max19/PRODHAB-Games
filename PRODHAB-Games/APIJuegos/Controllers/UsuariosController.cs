using APIJuegos.Data;
using APIJuegos.Helpers;
using APIJuegos.Modelos;

//John--------------------------------------------------
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

//---------------------------------------------------

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("FrontWithCookies")]
    [Authorize(Roles = "admin")]
    public class UsuariosController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public UsuariosController(JuegosProdhabContext context)
        {
            _context = context;
        }

        // GET: api/usuarios
        [HttpGet]
        public IActionResult Get()
        {
            var usuarios = _context.Usuarios
                .Include(u => u.Rol)
                .Select(u => new
                {
                    u.Correo,
                    Estado = u.Activo,
                    Rol = u.Rol.Nombre,
                    u.FechaCreacion
                })
                .ToList();

            return Ok(usuarios);
        }


        // GET: api/Usuarios/5
        [HttpGet("{idUsuarios}")]
        public ActionResult<Usuarios> GetById(int idUsuarios)
        {
            var usuario = _context.Usuarios.Find(idUsuarios);
            if (usuario == null)
                return NotFound();
            return usuario;
        }

        // GET api/usuarios/correo/{correo}
        [HttpGet("correo/{correo}")]
        public async Task<ActionResult<Usuarios>> GetByCorreo(string correo)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == correo);

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            return Ok(usuario);
        }

        // POST: api/usuarios
        [HttpPost]
        public ActionResult<Usuarios> Create(Usuarios nuevoUsuario)
        {
            if (nuevoUsuario == null || string.IsNullOrWhiteSpace(nuevoUsuario.Correo))
                return BadRequest("La usuarios debe tener un correo.");

            _context.Usuarios.Add(nuevoUsuario);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { idUsuario = nuevoUsuario.Id }, nuevoUsuario);
        }

        // PUT: api/Usuario/5
        [HttpPut("{idUsuario}")]
        public ActionResult Update(int id, Usuarios usuarioActualizado)
        {
            var usuario = _context.Usuarios.Find(id);
            if (usuario == null)
                return NotFound();

            usuario.Clave = usuarioActualizado.Clave;
            usuario.RolId = usuarioActualizado.RolId;
            usuario.Activo = usuarioActualizado.Activo;

            _context.SaveChanges();
            return Ok(usuario);
        }



        // DELETE: api/Usuario?correo=ejemplo@correo.com


        // DELETE: api/Usuarios/{correo}
        [HttpDelete("{correo}")] // correo viene en la URL
        public ActionResult DeleteByEmail(string correo)
        {
            if (string.IsNullOrEmpty(correo))
                return BadRequest("El correo es obligatorio");

            var usuario = _context.Usuarios.FirstOrDefault(u => u.Correo == correo);
            if (usuario == null)
                return NotFound();

            _context.Usuarios.Remove(usuario);
            _context.SaveChanges();

            return NoContent();
        }


        public record RegisterRequest(string Correo, string Password, int RolId, bool Activo);

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Correo) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { message = "Correo y contraseña son requeridos" });

            var existingUser = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo == req.Correo);

            if (existingUser != null)
            {
                if (existingUser.Activo)
                {
                    return BadRequest(new { message = "Ya existe un usuario activo con ese correo" });
                }
                else
                {
                    // 🔹 Reactivar usuario existente
        
                    var salt = PasswordHelper.GenerateSalt();
                    var hash = PasswordHelper.HashPassword(req.Password, salt);
                    existingUser.Salt = Convert.ToBase64String(salt);
                    existingUser.Clave = hash;


                    existingUser.RolId = req.RolId;
                    existingUser.Activo = true;  // lo marcamos como activo

                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Usuario reactivado correctamente" });
                }
            }

            // 🔹 Si no existe, se crea nuevo
            var nuevoSalt = PasswordHelper.GenerateSalt();
            var nuevoHash = PasswordHelper.HashPassword(req.Password, nuevoSalt);

            var user = new Usuarios
            {
                Correo = req.Correo,
                Clave = nuevoHash,                    // byte[]
                Salt = Convert.ToBase64String(nuevoSalt), // string
                RolId = req.RolId,
                FechaCreacion = DateTime.UtcNow,
                Activo = req.Activo
            };

            _context.Usuarios.Add(user);
            await _context.SaveChangesAsync();

            return Created("", new { message = "Usuario creado" });
        }



        [HttpPut("desactivar/{correo}")]
        public async Task<IActionResult> DesactivarUsuario(string correo)
        {
            // Obtener el correo del usuario logueado desde el JWT
            var correoLogueado = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

            if (correoLogueado == null)
                return Unauthorized(new { message = "Token inválido" });

            // Evitar que el admin se desactive a sí mismo
            if (correoLogueado.ToLower() == correo.ToLower())
                return BadRequest(new { message = "No puedes desactivar tu propia cuenta" });

            // Buscar el usuario a desactivar
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo.ToLower());

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
            // Buscar el usuario por correo (sin distinguir mayúsculas/minúsculas)
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo.ToLower());

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
        public async Task<IActionResult> ActualizarClave(string correo, [FromBody] CambiarClaveRequest request)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo.ToLower());

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });



            var nuevoSalt = PasswordHelper.GenerateSalt();
            var nuevoHash = PasswordHelper.HashPassword(request.NuevaClave, nuevoSalt);

            usuario.Salt = Convert.ToBase64String(nuevoSalt);
            usuario.Clave = nuevoHash;


            await _context.SaveChangesAsync();

            return Ok(new { message = "Clave actualizada correctamente" });
        }

    }
}