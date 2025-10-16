using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using APIJuegos.Data;
using APIJuegos.Modelos;
using APIJuegos.DTOs;
using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Cors;


namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]

    public class JuegosController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public JuegosController(JuegosProdhabContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }


        /// <summary>
        /// Evalúa y guarda las respuestas de un test.
        /// </summary>
        /// <param name="respuestas">Lista de respuestas enviadas por el usuario.</param>
        /// <returns>
        /// Retorna un <see cref="IActionResult"/> con el resultado de la evaluación, incluyendo:
        /// - Total de preguntas
        /// - Total de aciertos
        /// - Total de fallos
        /// - Calificación en porcentaje
        /// - Mensaje según el rango de evaluación
        /// - Detalle por pregunta y opción
        /// </returns>
        /// <remarks>
        /// Este endpoint realiza las siguientes acciones:
        /// 1. Valida que se hayan enviado respuestas.
        /// 2. Obtiene las opciones correctas de todas las preguntas de la base de datos.
        /// 3. Evalúa cada respuesta en memoria.
        /// 4. Calcula la calificación total.
        /// 5. Guarda el resultado en la tabla <c>ResultadosJuego</c> dentro de una transacción.
        /// 6. Obtiene el mensaje correspondiente según la tabla <c>RangoEvaluacion</c>.
        /// 7. Devuelve el resultado final con detalle por pregunta.
        /// </remarks>

        [HttpPost("evaluar/{idJuego:int}")]
        public async Task<IActionResult> GuardarRespuestas(
            int idJuego,
            [FromBody] List<PreguntaRespondidaDTO> respuestas)
        {
            if (respuestas == null || !respuestas.Any())
                return BadRequest("No se recibieron respuestas.");

            var resultadoDetalle = new List<object>();
            int totalAciertos = 0;

            // Obtener todas las opciones correctas de una sola vez
            var preguntaIds = respuestas.Select(r => r.IdPregunta).ToList();
            var opcionesCorrectasDict =
                await _context.Respuestas
                    .Where(r => preguntaIds.Contains(r.IdPregunta) && r.Es_correcta)
                    .GroupBy(r => r.IdPregunta)
                    .ToDictionaryAsync(g => g.Key, g => g.Select(r => r.Id).ToList());

            // Evaluar respuestas en memoria
            foreach (var r in respuestas)
            {
                opcionesCorrectasDict.TryGetValue(r.IdPregunta, out var correctas);
                correctas ??= new List<long>();

                bool preguntaCorrecta = ValidarPregunta(r.Opciones, correctas);
                if (preguntaCorrecta)
                    totalAciertos++;

                resultadoDetalle.Add(new
                {
                    IdPregunta = r.IdPregunta,
                    Opciones = r.Opciones
                                 .Select(o => new
                                 {
                                     IdOpcion = o.IdOpcion,
                                     Seleccionada = o.Seleccionada,
                                     Es_correcta = correctas.Contains(o.IdOpcion)
                                 })
                                 .ToList(),
                    Correcta = preguntaCorrecta
                });
            }

            int totalPreguntas = respuestas.Count;
            double calificacion =
                totalPreguntas > 0 ? (double)totalAciertos / totalPreguntas * 100 : 0;

            // Guardar en ResultadosJuego dentro de transacción
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var resultadoJuego = new ResultadosJuego
                {
                    IdJuegos = idJuego,
                    CantidadItems = totalPreguntas,
                    Aciertos = totalAciertos,
                    Nota = (decimal)calificacion,
                    FechaRegistro = DateTime.UtcNow
                };

                _context.ResultadosJuego.Add(resultadoJuego);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return BadRequest(
                    new { message = "Error al guardar en DB" });
            }

            // Obtener mensaje según RangoEvaluacion
            var mensajeRango =
                await _context.RangoEvaluacion
                    .Where(r => r.IdJuegos == idJuego &&
                                calificacion >= r.RangoMinimo &&
                                calificacion <= r.RangoMaximo)
                    .Select(r => r.Mensaje)
                    .FirstOrDefaultAsync();

            // Devolver resultado final con mensaje
            return Ok(CalcularResultadoFinal(totalPreguntas, totalAciertos,
                                             calificacion, resultadoDetalle,
                                             mensajeRango ?? "Sin mensaje"));
        }



        /// <summary>
        /// Valida si una pregunta fue respondida correctamente.
        /// </summary>
        /// <param name="opciones">Lista de opciones seleccionadas por el usuario.</param>
        /// <param name="opcionesCorrectas">Lista de IDs de las opciones correctas.</param>
        /// <returns><c>true</c> si la pregunta fue respondida correctamente; de lo contrario, <c>false</c>.</returns>

        private bool ValidarPregunta(List<OpcionDTO> opciones,
                                     List<long> opcionesCorrectas)
        {
            var seleccionadas =
                opciones.Where(o => o.Seleccionada).Select(o => o.IdOpcion).ToList();

            if (opcionesCorrectas.Count > 1)
                return seleccionadas.Count == opcionesCorrectas.Count &&
                       seleccionadas.All(o => opcionesCorrectas.Contains(o));
            else
                return seleccionadas.Count == 1 &&
                       opcionesCorrectas.Contains(seleccionadas.First());
        }


        /// <summary>
        /// Calcula el resultado final del test con mensaje y detalle por pregunta.
        /// </summary>
        /// <param name="totalPreguntas">Cantidad total de preguntas del test.</param>
        /// <param name="totalAciertos">Cantidad de respuestas correctas.</param>
        /// <param name="calificacion">Calificación en porcentaje.</param>
        /// <param name="detalle">Lista de detalle por pregunta y opción.</param>
        /// <param name="mensaje">Mensaje correspondiente según el rango de evaluación.</param>
        /// <returns>Objeto anónimo con el resultado final del test.</returns>        


        private object CalcularResultadoFinal(int totalPreguntas, int totalAciertos,
        double calificacion,
        List<object> detalle,
                                              string mensaje)
        {
            int totalFallos = totalPreguntas - totalAciertos;

            return new
            {
                totalPreguntas,
                totalAciertos,
                totalFallos,
                calificacion,
                mensaje = mensaje ?? "Sin mensaje definido para este rango",
                detalle
            };
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Juegos>>> Get()
        {
            return await _context.Juegos.ToListAsync();
        }

        [HttpGet("{idJuegos}")]
        public async Task<ActionResult<Juegos>> GetById(int idJuegos)
        {
            var juego = await _context.Juegos.FindAsync(idJuegos);
            if (juego == null)
                return NotFound();
            return juego;
        }

        [HttpPost]
        public async Task<ActionResult<Juegos>> Create(Juegos nuevoJuego)
        {
            if (nuevoJuego == null || string.IsNullOrWhiteSpace(nuevoJuego.Nombre))
                return BadRequest("El juego debe tener un nombre.");

            nuevoJuego.Descripcion ??= string.Empty;
            nuevoJuego.Detalle ??= string.Empty;

            _context.Juegos.Add(nuevoJuego);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById), new { idJuegos = nuevoJuego.IdJuegos }, nuevoJuego);
        }

        [HttpPut("{idJuegos}")]
        public async Task<ActionResult<Juegos>> Update(int idJuegos,
                                                       Juegos juegoActualizado)
        {
            var juego = await _context.Juegos.FindAsync(idJuegos);
            if (juego == null)
                return NotFound();

            juego.Nombre = juegoActualizado.Nombre ?? juego.Nombre;
            juego.Descripcion = juegoActualizado.Descripcion ?? juego.Descripcion;
            juego.Detalle = juegoActualizado.Detalle ?? juego.Detalle;

            await _context.SaveChangesAsync();

            return Ok(juego);
        }

        [HttpDelete("{idJuegos}")]
        public async Task<ActionResult> Delete(int idJuegos)
        {
            var juego = await _context.Juegos.FindAsync(idJuegos);
            if (juego == null)
                return NotFound();

            _context.Juegos.Remove(juego);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}