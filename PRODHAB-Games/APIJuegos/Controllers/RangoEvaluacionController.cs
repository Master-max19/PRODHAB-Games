/**
 * Documentación: Validación de Rangos de Evaluación (Semiabiertos)
 *
 * Contexto:
 * Cada juego puede tener varios rangos de puntuación (RangoEvaluacion) con límite mínimo y máximo.
 * Estos rangos determinan la calificación o mensaje asociado a un resultado numérico.
 *
 * Definición de Rango Semiabierto:
 * Cada rango se interpreta como [RangoMinimo, RangoMaximo)
 * - RangoMinimo: incluyente (valor pertenece al rango)
 * - RangoMaximo: excluyente (valor no pertenece al rango)
 *
 * Ejemplo:
 * ID | RangoMinimo | RangoMaximo | Intervalo | Valores que incluye
 * 1  | 0           | 50          | [0,50)    | 0 → 49.999...
 * 2  | 50          | 100         | [50,100)  | 50 → 99.999...
 *
 * Interpretación:
 * - Valor 49 → rango 1
 * - Valor 50 → rango 2
 * - Valor 100 → fuera de cualquier rango
 *
 * Justificación:
 * - Evita solapamientos: valores exactos de límite no quedan en dos rangos.
 * - Evita huecos: todos los valores continuos dentro del límite quedan cubiertos.
 *
 * Implementación:
 * private async Task<bool> ExisteRangoSolapado(RangoEvaluacion rango, int? idIgnorar = null)
 * - Detecta si un rango se superpone con alguno existente.
 * - r.RangoMaximo <= rango.RangoMinimo → no hay solapamiento
 * - r.RangoMinimo >= rango.RangoMaximo → no hay solapamiento
 * - Negación !() → detecta solapamiento
 * - idIgnorar → permite omitir un rango específico (útil al editar)
 *
 * Resultado:
 * - Evita rangos duplicados o solapados
 * - Garantiza cobertura continua de valores
 * - Cada valor numérico pertenece a un único rango
 */

using System.Net;
using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Cors;


namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableCors("FrontWithCookies")]
    public class RangoEvaluacionController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public RangoEvaluacionController(JuegosProdhabContext context)
        {
            _context = context;
        }

        [HttpGet("juego/{idJuego}")]
        public async Task<ActionResult<IEnumerable<RangoEvaluacion>>> GetPorJuego(int idJuego)
        {
            var rangos = await _context
                .RangoEvaluaciones.Where(r => r.IdJuego == idJuego)
                .OrderBy(r => r.RangoMinimo) // <-- orden ascendente por RangoMinimo
                .ToListAsync();

            if (!rangos.Any())
                return NotFound(new { message = "No se encontraron rangos para este juego." });

            return Ok(rangos);
        }

        [HttpPost("{idJuego}")]
        public async Task<ActionResult<RangoEvaluacion>> Crear(
            int idJuego,
            [FromBody] PostRangoEvaluacionDto dto
        )
        {
            var juegoExistente = await _context.Juegos.FindAsync(idJuego);
            if (juegoExistente == null)
                return BadRequest(new { mensaje = "El juego especificado no existe." });

            // Validaciones de rango
            if (dto.RangoMinimo < 0 || dto.RangoMaximo < 0)
                return BadRequest(
                    new { mensaje = "Los valores del rango no pueden ser negativos." }
                );

            if (dto.RangoMinimo > dto.RangoMaximo)
                return BadRequest(
                    new { mensaje = "El rango mínimo no puede ser mayor que el rango máximo." }
                );

            // Mapear DTO a entidad usando los mismos nombres
            var rango = new RangoEvaluacion
            {
                IdJuego = idJuego,
                RangoMinimo = dto.RangoMinimo,
                RangoMaximo = dto.RangoMaximo,
                Mensaje = dto.Mensaje,
            };

            if (await ExisteRangoSolapado(rango))
                return BadRequest(
                    new
                    {
                        mensaje = "El rango especificado se solapa con otro existente para este juego.",
                    }
                );

            _context.RangoEvaluaciones.Add(rango);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPorJuego), new { idJuego = rango.IdJuego }, rango);
        }

        [HttpPut("{idRangoEvaluacion}")]
        public async Task<IActionResult> Editar(
            int idRangoEvaluacion,
            [FromBody] PostRangoEvaluacionDto dto
        )
        {
            var existente = await _context.RangoEvaluaciones.FirstOrDefaultAsync(r =>
                r.IdRangoEvaluacion == idRangoEvaluacion
            );

            if (existente == null)
                return NotFound(new { message = "No se encontró el rango." });

            // Validaciones de rango
            if (dto.RangoMinimo < 0 || dto.RangoMaximo < 0)
                return BadRequest(
                    new { message = "Los valores del rango no pueden ser negativos." }
                );

            if (dto.RangoMinimo > dto.RangoMaximo)
                return BadRequest(
                    new { message = "El rango mínimo no puede ser mayor que el rango máximo." }
                );

            // Crear un objeto temporal para la validación de solapamiento
            var rangoTemp = new RangoEvaluacion
            {
                IdJuego = existente.IdJuego, // el juego no cambia
                RangoMinimo = dto.RangoMinimo,
                RangoMaximo = dto.RangoMaximo,
            };

            if (await ExisteRangoSolapado(rangoTemp, idRangoEvaluacion))
                return BadRequest(
                    new
                    {
                        message = "El rango especificado se solapa con otro existente para este juego.",
                    }
                );

            // Mapear los valores del DTO a la entidad existente
            existente.RangoMinimo = dto.RangoMinimo;
            existente.RangoMaximo = dto.RangoMaximo;
            existente.Mensaje = dto.Mensaje;

            await _context.SaveChangesAsync();

            return Ok(existente);
        }

        [HttpDelete("{idRangoEvaluacion}")]
        public async Task<IActionResult> Eliminar(int idRangoEvaluacion)
        {
            var rango = await _context.RangoEvaluaciones.FindAsync(idRangoEvaluacion);
            if (rango == null)
                return NotFound(new { message = "No se encontró el rango." });

            _context.RangoEvaluaciones.Remove(rango);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // No hay solapamiento si
        // nuevo.Max <= existente.Min  o nuevo.Min >= existente.Max
        // Entonces se solapa si no se cumple eso:
        private async Task<bool> ExisteRangoSolapado(RangoEvaluacion rango, int? idIgnorar = null)
        {
            return await _context.RangoEvaluaciones.AnyAsync(r =>
                r.IdJuego == rango.IdJuego
                && (idIgnorar == null || r.IdRangoEvaluacion != idIgnorar)
                && (r.RangoMinimo < rango.RangoMaximo && rango.RangoMinimo < r.RangoMaximo) // solapamiento real
            );
        }
    }
}
