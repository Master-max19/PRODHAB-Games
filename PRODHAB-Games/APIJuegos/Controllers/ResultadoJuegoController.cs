using System.Linq;
using System.Runtime.InteropServices;
using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Enums;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Authorize]
    [EnableCors("FrontWithCookies")]
    public class ResultadoJuegoController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public ResultadoJuegoController(JuegosProdhabContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [AllowAnonymous]
        [EnableCors("AllowAll")]
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
                return NotFound(new { message = "El juego no existe." });

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

            if ((APIJuegos.Enums.TipoJuego)infoJuego.IdTipoJuego == APIJuegos.Enums.TipoJuego.Test)
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
