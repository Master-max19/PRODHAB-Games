using APIJuegos.Data;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]

    public class RangoEvaluacionController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public RangoEvaluacionController(JuegosProdhabContext context)
        {
            _context = context;
        }

        // 1. Obtener todos los rangos de un juego
        [HttpGet("juego/{idJuego}")]
        public async Task<ActionResult<IEnumerable<RangoEvaluacion>>> GetPorJuego(int idJuego)
        {
            var rangos = await _context.RangoEvaluacion
                .Where(r => r.IdJuegos == idJuego)
                .OrderBy(r => r.RangoMinimo)  // <-- orden ascendente por RangoMinimo
                .ToListAsync();

            if (!rangos.Any())
                return NotFound(new { message = "No se encontraron rangos para este juego." });

            return Ok(rangos);
        }

        // 2. Agregar nuevo rango con validación
        [HttpPost]
        public async Task<ActionResult<RangoEvaluacion>> Crear(RangoEvaluacion rango)
        {
            rango.Mensaje = WebUtility.HtmlEncode(rango.Mensaje);

            // Validaciones de rango
            if (rango.RangoMinimo < 0 || rango.RangoMaximo < 0)
                return BadRequest(new { message = "Los valores del rango no pueden ser negativos." });

            if (rango.RangoMinimo > rango.RangoMaximo)
                return BadRequest(new { message = "El rango mínimo no puede ser mayor que el rango máximo." });

            if (await ExisteRangoSolapado(rango))
                return BadRequest(new { message = "El rango especificado se solapa con otro existente para este juego." });

            _context.RangoEvaluacion.Add(rango);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPorJuego), new { idJuego = rango.IdJuegos }, rango);
        }

        // 3. Editar rango
        [HttpPut("{id}")]
        public async Task<IActionResult> Editar(int id, RangoEvaluacion rango)
        {
            var existente = await _context.RangoEvaluacion
                .FirstOrDefaultAsync(r => r.Id == id);

            if (existente == null)
                return NotFound(new { message = "No se encontró el rango." });

            rango.Mensaje = WebUtility.HtmlEncode(rango.Mensaje);
            rango.IdJuegos = existente.IdJuegos; // no se cambia el juego

            // Validaciones de rango
            if (rango.RangoMinimo < 0 || rango.RangoMaximo < 0)
                return BadRequest(new { message = "Los valores del rango no pueden ser negativos." });

            if (rango.RangoMinimo > rango.RangoMaximo)
                return BadRequest(new { message = "El rango mínimo no puede ser mayor que el rango máximo." });

            if (await ExisteRangoSolapado(rango, id))
                return BadRequest(new { message = "El rango especificado se solapa con otro existente para este juego." });

            existente.RangoMinimo = rango.RangoMinimo;
            existente.RangoMaximo = rango.RangoMaximo;
            existente.Mensaje = rango.Mensaje;

            await _context.SaveChangesAsync();
            return Ok(existente);
        }

        // 4. Eliminar rango
        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            var rango = await _context.RangoEvaluacion.FindAsync(id);
            if (rango == null)
                return NotFound(new { message = "No se encontró el rango." });

            _context.RangoEvaluacion.Remove(rango);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Verificar si el nuevo rango se solapa con alguno existente
        private async Task<bool> ExisteRangoSolapado(RangoEvaluacion rango, int? idIgnorar = null)
        {
            return await _context.RangoEvaluacion.AnyAsync(r =>
                r.IdJuegos == rango.IdJuegos &&
                (idIgnorar == null || r.Id != idIgnorar) &&
                (
                    (rango.RangoMinimo >= r.RangoMinimo && rango.RangoMinimo <= r.RangoMaximo) ||
                    (rango.RangoMaximo >= r.RangoMinimo && rango.RangoMaximo <= r.RangoMaximo) ||
                    (rango.RangoMinimo <= r.RangoMinimo && rango.RangoMaximo >= r.RangoMaximo)
                )
            );
        }
    }
}
