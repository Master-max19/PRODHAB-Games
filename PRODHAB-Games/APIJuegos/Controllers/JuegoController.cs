using System.Runtime.InteropServices;
using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
    public class JuegoController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public JuegoController(JuegosProdhabContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JuegoDTO>>> GetAll()
        {
            var juegos = await _context
                .Juegos.Select(j => new JuegoDTO
                {
                    IdJuego = j.IdJuego,
                    Nombre = j.Nombre,
                    Descripcion = j.Descripcion,
                    Detalle = j.Detalle,
                    Activo = j.Activo,
                    IdTipoJuego = j.IdTipoJuego,
                })
                .ToListAsync();

            return juegos;
        }

        [HttpGet("{idJuego}")]
        public async Task<ActionResult<Juego>> GetById(int idJuego)
        {
            var juego = await _context.Juegos.FindAsync(idJuego);
            if (juego == null)
                return NotFound();
            return juego;
        }

        [HttpPost]
        public async Task<ActionResult<PostJuegoRespuestaDto>> Create(CrearJuegoDto nuevoJuegoDto)
        {
            if (nuevoJuegoDto == null || string.IsNullOrWhiteSpace(nuevoJuegoDto.Nombre))
                return BadRequest("El juego debe tener un nombre.");

            var tipoJuegoExiste = await _context.TipoJuegos.AnyAsync(t =>
                t.IdTipoJuego == nuevoJuegoDto.IdTipoJuego
            );

            if (!tipoJuegoExiste)
                return BadRequest($"El TipoJuego con Id {nuevoJuegoDto.IdTipoJuego} no existe.");

            var juegoEntidad = new Juego
            {
                Nombre = nuevoJuegoDto.Nombre,
                Descripcion = nuevoJuegoDto.Descripcion ?? string.Empty,
                Detalle = nuevoJuegoDto.Detalle ?? string.Empty,
                Activo = nuevoJuegoDto.Activo,
                IdTipoJuego = nuevoJuegoDto.IdTipoJuego,
            };

            _context.Juegos.Add(juegoEntidad);
            await _context.SaveChangesAsync();

            var juegoRespuesta = new PostJuegoRespuestaDto
            {
                IdJuego = juegoEntidad.IdJuego,
                Nombre = juegoEntidad.Nombre,
                Descripcion = juegoEntidad.Descripcion,
                Detalle = juegoEntidad.Detalle,
                Activo = juegoEntidad.Activo,
                IdTipoJuego = juegoEntidad.IdTipoJuego,
            };

            return CreatedAtAction(
                nameof(GetById),
                new { idJuego = juegoEntidad.IdJuego },
                juegoRespuesta
            );
        }

        [HttpPatch("{idJuego}")]
        public async Task<ActionResult<PostJuegoRespuestaDto>> UpdatePartial(
            int idJuego,
            [FromBody] JuegoUpdateDto juegoDto
        )
        {
            var juego = await _context.Juegos.FindAsync(idJuego);
            if (juego == null)
                return NotFound();

            if (juegoDto.Nombre != null)
                juego.Nombre = juegoDto.Nombre;

            if (juegoDto.Descripcion != null)
                juego.Descripcion = juegoDto.Descripcion;

            if (juegoDto.Detalle != null)
                juego.Detalle = juegoDto.Detalle;

            if (juegoDto.Activo.HasValue)
                juego.Activo = juegoDto.Activo.Value;

            await _context.SaveChangesAsync();

            // Mapear a Dto de respuesta
            var juegoRespuesta = new PostJuegoRespuestaDto
            {
                IdJuego = juego.IdJuego,
                Nombre = juego.Nombre,
                Descripcion = juego.Descripcion,
                Detalle = juego.Detalle,
                Activo = juego.Activo,
                IdTipoJuego = juego.IdTipoJuego,
            };

            return Ok(juegoRespuesta);
        }

        [HttpDelete("{idJuego}")]
        public async Task<ActionResult> Delete(int idJuego)
        {
            var juego = await _context.Juegos.FindAsync(idJuego);
            if (juego == null)
                return NotFound();

            _context.Juegos.Remove(juego);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<PostJuegoRespuestaDto>>> Buscar(
            [FromQuery] string? nombre = null,
            [FromQuery] int? idTipoJuego = null,
            [FromQuery] bool? activo = null
        )
        {
            var query = _context.Juegos.AsQueryable();

            if (!string.IsNullOrWhiteSpace(nombre))
                query = query.Where(j => EF.Functions.Like(j.Nombre, $"%{nombre}%"));

            if (idTipoJuego.HasValue)
                query = query.Where(j => j.IdTipoJuego == idTipoJuego.Value);

            if (activo.HasValue)
                query = query.Where(j => j.Activo == activo.Value);

            var juegosFiltrados = await query
                .Select(j => new PostJuegoRespuestaDto
                {
                    IdJuego = j.IdJuego,
                    Nombre = j.Nombre,
                    Descripcion = j.Descripcion,
                    Detalle = j.Detalle,
                    Activo = j.Activo,
                    IdTipoJuego = j.IdTipoJuego,
                })
                .ToListAsync();

            if (!juegosFiltrados.Any())
                return NotFound("No se encontraron juegos que coincidan con los criterios.");

            return Ok(juegosFiltrados);
        }
    }
}
