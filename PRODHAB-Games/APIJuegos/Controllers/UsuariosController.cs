using APIJuegos.Data;
using APIJuegos.Data.Helpers;
using APIJuegos.Data.Modelos;
using Azure.Core;

//John--------------------------------------------------
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json;
//---------------------------------------------------

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("FrontWithCookies")]
    [Authorize(Roles = "admin")]
    public class UsuariosController : ControllerBase
    {
        private readonly PracticaJuegosUcrContext _context;

        public UsuariosController(PracticaJuegosUcrContext context)
        {
            _context = context;
        }

        // GET: api/usuarios
        [HttpGet]
        public IEnumerable<Usuarios> Get()
        {
            return _context.Usuarios.ToList();
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

        // DELETE: api/Usuario/5
        [HttpDelete("{idUsuario}")]
        public ActionResult Delete(int idUsuario)
        {
            var usuario = _context.Usuarios.Find(idUsuario);
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

                    existingUser.Salt = salt;
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
                Clave = nuevoHash,
                Salt = nuevoSalt,
                RolId = req.RolId,
                FechaCreacion = DateTime.UtcNow,
                Activo = req.Activo
            };

            _context.Usuarios.Add(user);
            await _context.SaveChangesAsync();

            return Created("", new { message = "Usuario creado" });
        }


        [HttpPut("desactivar/{id}")]
        public async Task<IActionResult> DesactivarUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            usuario.Activo = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario desactivado correctamente" });
        }

        [HttpPut("activar/{id}")]
        public async Task<IActionResult> ActivarUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            usuario.Activo = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario activado correctamente" });
        }

        public record CambiarClaveRequest(string NuevaClave);


        [HttpPut("actualizar-clave/{id}")]
        public async Task<IActionResult> ActualizarClave(int id, [FromBody] CambiarClaveRequest request)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            var nuevoSalt = PasswordHelper.GenerateSalt();
            var nuevoHash = PasswordHelper.HashPassword(request.NuevaClave, nuevoSalt);

            usuario.Salt = nuevoSalt;
            usuario.Clave = nuevoHash;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Clave actualizada correctamente" });
        }

    }
}