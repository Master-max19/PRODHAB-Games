using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [EnableCors("FrontWithCookies")]
    public class PalabraJuegoController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public PalabraJuegoController(JuegosProdhabContext context)
        {
            _context = context;
        }

        /**
        Busca las palabras de un juego por medio de su identificador y las devuelve asociadas
        con loss detalles del mismo juego, ya sea descripción, nombre y etc.
        */
        [HttpGet("porJuego/{idJuego}")]
        public async Task<IActionResult> GetPalabrasPorJuego(int idJuego)
        {
            var resultado = await _context
                .Juegos.Where(j => j.IdJuego == idJuego)
                .Select(j => new
                {
                    IdJuego = j.IdJuego,
                    j.Nombre,
                    j.Descripcion,
                    j.Detalle,

                    Palabras = j
                        .PalabrasJuego.Select(pj => new
                        {
                            pj.IdPalabraJuego,
                            pj.Palabra,
                            pj.Activa,
                        })
                        .ToList(),
                })
                .FirstOrDefaultAsync();

            if (resultado == null)
            {
                return NotFound(new { mensaje = $"Juego con ID {idJuego} no encontrado." });
            }

            return Ok(resultado);
        }

        /**
        Solo trae las palabras del juego asociado pero no sus detalles.
        */
        [HttpGet("solo-palabras/{idJuego}")]
        [AllowAnonymous]
        [EnableCors("AllowAll")]
        public async Task<IActionResult> GetSoloPalabrasPorJuego(int idJuego)
        {
            var resultado = await _context
                .Juegos.Where(j => j.IdJuego == idJuego && j.Activo) // 🔹 solo juegos activos
                .Select(j => new
                {
                    IdJuego = j.IdJuego,
                    j.Descripcion,
                    j.Detalle,
                    j.Nombre,
                    Palabras = j.PalabrasJuego.Select(pj => pj.Palabra).ToList(),
                })
                .FirstOrDefaultAsync();

            if (resultado == null)
            {
                return NotFound(new { mensaje = $"Juego con ID {idJuego} no encontrado." });
            }

            return Ok(resultado);
        }

        /*Permite registrar en la base de datos una lista de palabras o varias a la vez*/
        [HttpPost("{idJuego}/multiples")]
        public async Task<ActionResult<PalabrasResponseDto>> PostMultiplesPalabras(
            int idJuego,
            [FromBody] PalabrasRequestDto request
        )
        {
            if (request.Palabras.Any(p => p.Length > 50))
                return BadRequest(
                    new { mensaje = "Cada palabra no puede superar los 50 caracteres." }
                );

            if (request == null || request.Palabras == null || !request.Palabras.Any())
                return BadRequest(
                    new PalabrasResponseDto
                    {
                        Mensaje = "Debe enviar al menos una palabra.",
                        Total = 0,
                    }
                );

            var juegoExiste = await _context.Juegos.AnyAsync(j => j.IdJuego == idJuego);
            if (!juegoExiste)
                return NotFound(
                    new PalabrasResponseDto
                    {
                        Mensaje = $"El IdJuego {idJuego} no existe.",
                        Total = 0,
                    }
                );

            // Crear objetos PalabraJuego
            var nuevasPalabras = request
                .Palabras.Select(p => new PalabraJuego
                {
                    IdJuego = idJuego,
                    Palabra = p,
                    Activa = true,
                })
                .ToList();

            _context.PalabraJuegos.AddRange(nuevasPalabras);
            await _context.SaveChangesAsync();

            // Preparar respuesta con palabra e id
            var palabrasRespuesta = nuevasPalabras
                .Select(p => new PalabraIdDto
                {
                    IdPalabraJuego = p.IdPalabraJuego,
                    Palabra = p.Palabra,
                })
                .ToList();

            return Ok(
                new PalabrasResponseDto
                {
                    Mensaje = "Palabras registradas correctamente",
                    Total = palabrasRespuesta.Count,
                    Palabras = palabrasRespuesta,
                }
            );
        }

        [HttpDelete("{idPalabraJuego}")]
        public async Task<IActionResult> DeletePalabra(int idPalabraJuego)
        {
            var palabra = await _context.PalabraJuegos.FindAsync(idPalabraJuego);
            if (palabra == null)
                return NotFound();

            _context.PalabraJuegos.Remove(palabra);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /*Elimina toda palabta que se relacione con el idJuego*/
        [HttpDelete("porJuego/{idJuego}")]
        public async Task<ActionResult<PalabrasResponseDto>> DeletePalabrasPorJuego(int idJuego)
        {
            var palabras = await _context
                .PalabraJuegos.Where(p => p.IdJuego == idJuego)
                .ToListAsync();

            if (!palabras.Any())
                return NotFound(
                    new PalabrasResponseDto
                    {
                        Mensaje = $"No hay palabras registradas para el juego con ID {idJuego}",
                        Total = 0,
                    }
                );

            _context.PalabraJuegos.RemoveRange(palabras);
            await _context.SaveChangesAsync();

            return Ok(
                new PalabrasResponseDto
                {
                    Mensaje = "Todas las palabras del juego fueron eliminadas correctamente",
                    Total = palabras.Count,
                }
            );
        }

        private bool ExistePalabra(int idPalabraJuego)
        {
            return _context.PalabraJuegos.Any(e => e.IdPalabraJuego == idPalabraJuego);
        }
    }
}
