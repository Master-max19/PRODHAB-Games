using System.Net;
using APIJuegos.Data;
using APIJuegos.DTOs; // Aseg�rate de incluir el namespace correcto para RecibirItemSopaDTO
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SopaLetrasController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public SopaLetrasController(JuegosProdhabContext context)
        {
            _context = context;
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
    }
}
