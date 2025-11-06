using System.Linq;
using System.Runtime.InteropServices;
using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [ApiController]
    // [Route("api/[controller]")]
    [Authorize]
    [EnableCors("FrontWithCookies")]
    public class ResultadoJuegoController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public ResultadoJuegoController(JuegosProdhabContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /*
        [HttpPost("registrar/{idJuego:int}")]
        public async Task<IActionResult> RegistrarResultado(int idJuego, [FromBody] ResultadoJuego dto)
        {
            // Verificar que el juego exista
            bool existeJuego = await _context.Juegos
                .AsNoTracking()
                .AnyAsync(j => j.IdJuego == idJuego);
        
            if (!existeJuego)
                return NotFound("El juego no existe.");
        
            // Validaciones básicas
            if (dto.CantidadItems < 0 || dto.CantidadItems > 999)
                return BadRequest("La cantidad de items debe ser entre 0 y 999.");
        
            if (dto.CantidadAciertos < 0 || dto.CantidadAciertos > 999)
                return BadRequest("La cantidad de aciertos debe ser entre 0 y 999.");
        
            if (dto.Nota < 0 || dto.Nota > 100)
                return BadRequest("La nota debe estar entre 0 y 100.");
        
            // Validación lógica
            if (dto.CantidadAciertos > dto.CantidadItems)
                return BadRequest("La cantidad de aciertos no puede ser mayor que la cantidad de items.");
        
            // Crear resultado
            var nuevo = new ResultadoJuego
            {
                IdJuego = idJuego,
                CantidadItems = dto.CantidadItems,
                CantidadAciertos = dto.CantidadAciertos,
                Nota = Math.Round(dto.Nota, 2),
                FechaRegistro = DateTime.Now
            };
        
            _context.ResultadoJuegos.Add(nuevo);
            await _context.SaveChangesAsync();
        
            return Ok(new { Mensaje = "OK", nuevo.IdResultadoJuego });
        }
        */
        [HttpPost("registrar/{idJuego:int}")]
        public async Task<IActionResult> RegistrarResultado(int idJuego)
        {
            bool existeJuego = await _context
                .Juegos.AsNoTracking()
                .AnyAsync(j => j.IdJuego == idJuego);
            if (!existeJuego)
                return NotFound("El juego no existe.");

            const int CANTIDAD_ITEMS_ESTATICO = 0;
            const int ACIERTOS_ESTATICO = 0;
            const decimal NOTA_ESTATICA = 10.00m;

            var nuevo = new ResultadoJuego
            {
                IdJuego = idJuego,
                CantidadItems = CANTIDAD_ITEMS_ESTATICO,
                CantidadAciertos = ACIERTOS_ESTATICO,
                Nota = Math.Round(NOTA_ESTATICA, 2),
                FechaRegistro = DateTime.Now,
            };

            _context.ResultadoJuegos.Add(nuevo);
            await _context.SaveChangesAsync();

            return Ok(new { Mensaje = "OK", nuevo.IdResultadoJuego });
        }

        [HttpGet("estadisticas/{idJuego:int}")]
        public async Task<IActionResult> GetEstadisticasJuego(int idJuego)
        {
            // Trae existencia + tipo de evaluación en la misma consulta
            var infoJuego = await _context
                .Juegos.AsNoTracking()
                .Where(j => j.IdJuego == idJuego)
                .Select(j => new
                {
                    j.IdJuego,
                    j.IdTipoJuego,
                    TipoEvaluacion = j.Nombre,
                })
                .FirstOrDefaultAsync();

            if (infoJuego is null)
                return NotFound("El juego no existe.");

            // Fechas base
            var desde30Dias = DateTime.Now.AddDays(-30);
            var inicioMes = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

            // Base de resultados
            var resultados = _context
                .ResultadoJuegos.AsNoTracking()
                .Where(r => r.IdJuego == idJuego);

            // Últimos 30 días
            var cantidad30Dias = await resultados
                .Where(r => r.FechaRegistro >= desde30Dias)
                .CountAsync();

            // Mes actual
            var cantidadMesActual = await resultados
                .Where(r => r.FechaRegistro >= inicioMes)
                .CountAsync();

            // Si es tipo 1 (por ejemplo, evaluaciones que tienen nota promedio)
            if (infoJuego.IdTipoJuego == 1)
            {
                var promedio =
                    await resultados
                        .Where(r => r.FechaRegistro >= desde30Dias)
                        .AverageAsync(r => (decimal?)r.Nota) ?? 0m;

                return Ok(
                    new
                    {
                        IdJuego = idJuego,
                        TipoEvaluacion = infoJuego.TipoEvaluacion,
                        CantidadRegistrosUlt30Dias = cantidad30Dias,
                        PromedioNotaUlt30Dias = Math.Round(promedio, 2),
                        CantidadMesActual = cantidadMesActual,
                    }
                );
            }

            // Otros tipos de juego sin promedio
            return Ok(
                new
                {
                    IdJuego = idJuego,
                    TipoEvaluacion = infoJuego.TipoEvaluacion,
                    CantidadRegistrosUlt30Dias = cantidad30Dias,
                    PromedioNotaUlt30Dias = 100,
                    CantidadMesActual = cantidadMesActual,
                }
            );
        }
    }
}
