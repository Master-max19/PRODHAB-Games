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
    [Route("api/[controller]")]
    [EnableCors("FrontWithCookies")]
    [Authorize]
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

        [AllowAnonymous]
        [EnableCors("AllowAll")]
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

        [AllowAnonymous]
        [EnableCors("AllowAll")]
        [HttpPost("evaluar/{idTest:int}")]
        public async Task<IActionResult> GuardarRespuestas(
            int idTest,
            [FromBody] List<PreguntaRespondidaDto> respuestas
        )
        {
            if (respuestas == null || !respuestas.Any())
                return BadRequest("No se recibieron respuestas.");

            var preguntaIds = respuestas.Select(r => r.IdPregunta).ToList(); // List<long>

            // 1. CARGAR RESPUESTAS CORRECTAS (solo las correctas)
            var correctasDict = await _context
                .Respuestas.AsNoTracking()
                .Where(r => preguntaIds.Contains(r.IdPregunta) && r.EsCorrecta)
                .GroupBy(r => r.IdPregunta)
                .ToDictionaryAsync(
                    g => g.Key,
                    g =>
                        g.Select(r => new
                            {
                                r.IdRespuesta,
                                Retroalimentacion = r.Retroalimentacion ?? string.Empty,
                            })
                            .ToList()
                );

            // 2. PRE-CALCULAR: HashSet<long> para O(1) en Contains
            var correctasSet = correctasDict.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.Select(x => x.IdRespuesta).ToHashSet()
            );

            // 3. PRE-CALCULAR: Dictionary<long, string> para retroalimentación
            var retroDict = correctasDict.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.ToDictionary(x => x.IdRespuesta, x => x.Retroalimentacion)
            );

            double totalAciertos = 0;
            int totalFallos = 0;
            int totalPreguntas = respuestas.Count;

            var resultadoDetalle = new List<object>(totalPreguntas);

            // 4. PROCESAR CADA PREGUNTA
            foreach (var r in respuestas)
            {
                correctasSet.TryGetValue(r.IdPregunta, out var set);
                set ??= new HashSet<long>(); // ← ahora sí, mismo tipo

                retroDict.TryGetValue(r.IdPregunta, out var retroMap);
                retroMap ??= new Dictionary<long, string>(); // ← mismo tipo

                int aciertos = 0;
                int fallos = 0;
                var opcionesResultado = new List<object>(r.Opciones.Count);

                foreach (var o in r.Opciones)
                {
                    bool esCorrecta = set.Contains(o.IdOpcion);
                    if (o.Seleccionada)
                    {
                        if (esCorrecta)
                            aciertos++;
                        else
                            fallos++;
                    }

                    opcionesResultado.Add(
                        new
                        {
                            o.IdOpcion,
                            o.Seleccionada,
                            EsCorrecta = esCorrecta,
                            Retroalimentacion = esCorrecta
                                ? retroMap.GetValueOrDefault(o.IdOpcion, string.Empty)
                                : string.Empty,
                        }
                    );
                }

                bool esMultiple = set.Count > 1;
                double puntos =
                    esMultiple ? (fallos == 0 ? (double)aciertos / set.Count : 0)
                    : (fallos == 0 && aciertos == 1) ? 1
                    : 0;

                totalAciertos += puntos;
                totalFallos += fallos;

                resultadoDetalle.Add(
                    new
                    {
                        r.IdPregunta,
                        Opciones = opcionesResultado,
                        Puntos = puntos,
                        Fallos = fallos,
                    }
                );
            }

            double calificacion = totalPreguntas > 0 ? (totalAciertos / totalPreguntas) * 100 : 0;

            // 5. GUARDAR RESULTADO
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var resultado = new ResultadoJuego
                {
                    IdJuego = idTest,
                    CantidadItems = totalPreguntas,
                    CantidadAciertos = (int)Math.Round(totalAciertos),
                    Nota = (decimal)calificacion,
                    FechaRegistro = DateTime.UtcNow,
                };

                _context.ResultadoJuegos.Add(resultado);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "Error al guardar en DB" });
            }

            // 6. MENSAJE DE RANGO
            var mensajeRango =
                await _context
                    .RangoEvaluaciones.AsNoTracking()
                    .Where(r =>
                        r.IdJuego == idTest
                        && calificacion >= r.RangoMinimo
                        && calificacion < r.RangoMaximo
                    )
                    .Select(r => r.Mensaje)
                    .FirstOrDefaultAsync() ?? "Sin mensaje";

            // 7. RESULTADO FINAL
            return Ok(
                CalcularResultadoFinal(
                    totalPreguntas,
                    (int)Math.Round(totalAciertos),
                    totalFallos,
                    calificacion,
                    resultadoDetalle,
                    mensajeRango
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
