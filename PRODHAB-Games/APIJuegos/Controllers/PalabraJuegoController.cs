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

        // GET: api/PalabraJuego
        [HttpGet]
        [AllowAnonymous]
        [EnableCors("AllowAll")]
        public async Task<ActionResult<IEnumerable<PalabraJuego>>> GetPalabras()
        {
            return await _context.PalabraJuegos.ToListAsync();
        }

        // GET: api/PalabraJuego/porJuego/5

        [HttpGet("porJuego/{idJuego}")]
        public async Task<IActionResult> GetPalabrasPorJuego(int idJuego)
        {
            // 1. Ejecuta una única consulta para obtener el juego Y sus palabras
            var resultado = await _context
                .Juegos.Where(j => j.IdJuego == idJuego)
                .Select(j => new // Proyecta la información del juego y las palabras asociadas
                {
                    // Detalles del juego (la parte principal del objeto)
                    IdJuego = j.IdJuego,
                    j.Nombre,
                    j.Descripcion,
                    j.Detalle,

                    // Proyecta la lista de palabras relacionadas
                    Palabras = j
                        .PalabrasJuego.Select(pj => new
                        {
                            pj.IdPalabraJuego,
                            pj.Palabra,
                            pj.Activa,
                        })
                        .ToList(),
                })
                .FirstOrDefaultAsync(); // Obtiene solo un resultado (el juego con ese ID)

            if (resultado == null)
            {
                return NotFound(new { mensaje = $"Juego con ID {idJuego} no encontrado." });
            }

            // 2. Devolver la respuesta (el objeto ya está en el formato deseado)
            return Ok(resultado);
        }

        [HttpGet("solo-palabras/{idJuego}")] // Nuevo endpoint para claridad
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

        [HttpPost]
        public async Task<ActionResult<PalabraJuego>> PostPalabra(PalabraJuego palabraJuego)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var juegoExiste = await _context.Juegos.AnyAsync(j =>
                j.IdJuego == palabraJuego.IdJuego
            );
            if (!juegoExiste)
                return BadRequest(
                    new { mensaje = $"El IdJuego {palabraJuego.IdJuego} no existe." }
                );

            _context.PalabraJuegos.Add(palabraJuego);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Mensaje gen�rico, no exponemos detalles de la DB
                return StatusCode(
                    500,
                    new
                    {
                        mensaje = "Ocurrio un error al guardar la palabra. Intente nuevamente mas tarde.",
                    }
                );
            }

            return CreatedAtAction(
                nameof(GetPalabrasPorJuego),
                new { idJuego = palabraJuego.IdJuego },
                palabraJuego
            );
        }

        [HttpPost("{idJuego}/multiples")]
        public async Task<ActionResult<PalabrasResponseDto>> PostMultiplesPalabras(
            int idJuego,
            [FromBody] PalabrasRequestDto request
        )
        {
            if (request == null || request.Palabras == null || !request.Palabras.Any())
                return BadRequest(
                    new PalabrasResponseDto
                    {
                        Mensaje = "Debe enviar al menos una palabra.",
                        Total = 0,
                    }
                );

            // Validar que el juego exista
            var juegoExiste = await _context.Juegos.AnyAsync(j => j.IdJuego == idJuego);
            if (!juegoExiste)
                return BadRequest(
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

        // DELETE: api/PalabraJuego/5
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

        // DELETE: api/PalabraJuego/porJuego/5
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

        // PUT: api/PalabraJuego/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutPalabra(int id, PalabraJuego palabraJuego)
        {
            if (id != palabraJuego.IdPalabraJuego)
                return BadRequest();

            _context.Entry(palabraJuego).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExistePalabra(id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        private bool ExistePalabra(int idPalabraJuego)
        {
            return _context.PalabraJuegos.Any(e => e.IdPalabraJuego == idPalabraJuego);
        }
    }
}
