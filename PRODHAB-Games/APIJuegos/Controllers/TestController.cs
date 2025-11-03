using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public TestController(JuegosProdhabContext context)
        {
            _context = context;
        }

        [HttpGet("admin/{idTest}/con-respuestas")]
        //   [Authorize]
        public ActionResult GetPreguntasConRespuestasPorJuego(int idTest)
        {
            // Primero obtenemos los idPregunta asociados al juego
            var preguntasIds = _context
                .PreguntaJuegos.Where(pj => pj.IdJuego == idTest)
                .Select(pj => pj.IdPregunta)
                .ToList();

            // Luego obtenemos las preguntas y sus respuestas
            var resultado = _context
                .Preguntas.Where(p => preguntasIds.Contains(p.IdPregunta))
                .Select(p => new
                {
                    Pregunta = p,
                    Respuestas = _context
                        .Respuestas.Where(r => r.IdPregunta == p.IdPregunta)
                        .ToList(),
                })
                .ToList();

            return Ok(resultado);
        }

        [HttpGet("preguntas/{idTest}")]
        public async Task<IActionResult> GetPreguntasAleatorias(int idTest)
        {
            try
            {
                if (idTest <= 0)
                    return BadRequest(new { exito = false, mensaje = "ID de juego inválido" });

                var juego = await _context.Juegos.FindAsync(idTest);
                if (juego == null)
                    return NotFound(new { exito = false, mensaje = "Juego no encontrado" });

                var preguntasBase = await (
                    from pj in _context.PreguntaJuegos
                    join p in _context.Preguntas on pj.IdPregunta equals p.IdPregunta
                    join j in _context.Juegos on pj.IdJuego equals j.IdJuego
                    where pj.IdJuego == idTest && p.Activa && j.Activo
                    select new
                    {
                        p.IdPregunta,
                        p.Enunciado,
                        p.Tipo,
                    }
                ).ToListAsync();

                if (!preguntasBase.Any())
                    return Ok(
                        new
                        {
                            exito = true,
                            Nombre = juego.Nombre,
                            Descripcion = juego.Descripcion,
                            Detalle = juego.Detalle,
                            Preguntas = new List<object>(),
                        }
                    );

                var idsPreguntas = preguntasBase.Select(p => p.IdPregunta).ToList();

                var todasRespuestas = await _context
                    .Respuestas.Where(r => idsPreguntas.Contains(r.IdPregunta))
                    .Select(r => new OpcionesTestDto
                    {
                        IdRespuesta = r.IdRespuesta,
                        IdPregunta = r.IdPregunta,
                        Texto = r.Texto,
                        Retroalimentacion = r.Retroalimentacion,
                    })
                    .ToListAsync();

                var respuestasMap = todasRespuestas
                    .GroupBy(r => r.IdPregunta)
                    .ToDictionary(g => g.Key, g => g.ToList());

                var preguntasFinal = preguntasBase
                    .Select(p => new
                    {
                        p.IdPregunta,
                        p.Enunciado,
                        p.Tipo,
                        Respuestas = respuestasMap.ContainsKey(p.IdPregunta)
                            ? respuestasMap[p.IdPregunta]
                            : new List<OpcionesTestDto>(),
                    })
                    .ToList();

                preguntasFinal = MezclarFisherYates(preguntasFinal);

                return Ok(
                    new
                    {
                        exito = true,
                        Nombre = juego.Nombre,
                        Descripcion = juego.Descripcion,
                        Detalle = juego.Detalle,
                        Preguntas = preguntasFinal,
                    }
                );
            }
            catch
            {
                return StatusCode(
                    500,
                    new { exito = false, mensaje = "Ocurrió un error al obtener las preguntas" }
                );
            }
        }

        /***
        Si la pregunta es de selección única, marcar la opción correcta suma un punto completo; si la pregunta es de selección múltiple, cada opción correcta marcada suma una fracción del punto, de manera que se obtiene el punto completo únicamente al seleccionar todas las opciones correctas sin equivocarse
        **/

        [HttpPost("evaluar/{idTest:int}")]
        public async Task<IActionResult> GuardarRespuestas(
            int idTest,
            [FromBody] List<PreguntaRespondidaDto> respuestas
        )
        {
            if (respuestas == null || !respuestas.Any())
                return BadRequest("No se recibieron respuestas.");

            int totalAciertos = 0;
            int totalFallos = 0;
            int totalPreguntas = respuestas.Count;
            int preguntasCorrectas = 0;

            var preguntaIds = respuestas.Select(r => r.IdPregunta).ToList();

            // Traer solo los datos necesarios y sin tracking
            var opcionesCorrectasDict = await _context
                .Respuestas.AsNoTracking()
                .Where(r => preguntaIds.Contains(r.IdPregunta) && r.EsCorrecta)
                .GroupBy(r => r.IdPregunta)
                .ToDictionaryAsync(g => g.Key, g => g.Select(r => r.IdRespuesta).ToList());

            // Procesar todas las respuestas en un solo recorrido
            var resultadoDetalle = respuestas
                .Select(r =>
                {
                    opcionesCorrectasDict.TryGetValue(r.IdPregunta, out var correctas);
                    correctas ??= new List<long>();

                    // Opciones seleccionadas incorrectamente
                    int fallosPregunta = r.Opciones.Count(o =>
                        o.Seleccionada && !correctas.Contains(o.IdOpcion)
                    );

                    // Opciones correctas seleccionadas
                    int aciertosPregunta = r.Opciones.Count(o =>
                        o.Seleccionada && correctas.Contains(o.IdOpcion)
                    );

                    // Verificar si todas las correctas fueron seleccionadas
                    bool todasCorrectasSeleccionadas = correctas.All(id =>
                        r.Opciones.Any(o => o.IdOpcion == id && o.Seleccionada)
                    );

                    // La pregunta se considera correcta si no hay fallos y todas las correctas están seleccionadas
                    if (fallosPregunta == 0 && todasCorrectasSeleccionadas)
                        preguntasCorrectas++;

                    totalAciertos += aciertosPregunta;
                    totalFallos += fallosPregunta;

                    return new
                    {
                        r.IdPregunta,
                        Opciones = r
                            .Opciones.Select(o => new
                            {
                                o.IdOpcion,
                                o.Seleccionada,
                                EsCorrecta = correctas.Contains(o.IdOpcion),
                            })
                            .ToList(),
                        Aciertos = aciertosPregunta,
                        Fallos = fallosPregunta,
                    };
                })
                .ToList();

            double calificacion =
                totalPreguntas > 0 ? ((double)preguntasCorrectas / totalPreguntas) * 100 : 0;

            // Guardar resultado en DB (sin transacción extra)

            try
            {
                var resultadoJuego = new ResultadoJuego
                {
                    IdJuego = idTest,
                    CantidadItems = totalPreguntas,
                    CantidadAciertos = totalAciertos,
                    Nota = (decimal)calificacion,
                    FechaRegistro = DateTime.UtcNow,
                };

                _context.ResultadoJuegos.Add(resultadoJuego);
                await _context.SaveChangesAsync();
            }
            catch
            {
                return BadRequest(new { message = "Error al guardar en DB" });
            }

            // Obtener mensaje del rango correspondiente
            var mensajeRango = await _context
                .RangoEvaluaciones.AsNoTracking()
                .Where(r =>
                    r.IdJuego == idTest
                    && calificacion >= r.RangoMinimo
                    && calificacion < r.RangoMaximo
                )
                .Select(r => r.Mensaje)
                .FirstOrDefaultAsync();

            return Ok(
                CalcularResultadoFinal(
                    totalPreguntas,
                    totalAciertos,
                    totalFallos,
                    calificacion,
                    resultadoDetalle.Cast<object>().ToList(), // <-- aquí
                    mensajeRango ?? "Sin mensaje"
                )
            );
        }

        private object CalcularResultadoFinal(
            int totalPreguntas,
            int totalAciertos,
            int totalFallos,
            double calificacion,
            List<object> detalle,
            string mensaje
        )
        {
            return new
            {
                totalPreguntas,
                totalAciertos,
                totalFallos,
                calificacion,
                mensaje = mensaje ?? "Sin mensaje definido para este rango",
                detalle,
            };
        }

        private List<T> MezclarFisherYates<T>(List<T> lista)
        {
            var random = new Random();
            for (int i = lista.Count - 1; i > 0; i--)
            {
                int randomIndex = random.Next(i + 1);
                var temp = lista[i];
                lista[i] = lista[randomIndex];
                lista[randomIndex] = temp;
            }
            return lista;
        }
    }
}
