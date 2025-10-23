using APIJuegos.Data;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using APIJuegos.DTOs;
using Microsoft.AspNetCore.Cors;
using System.Text.Json;
using System.Net;
using Microsoft.AspNetCore.Authorization;



namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]

    public class PreguntasController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public PreguntasController(JuegosProdhabContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Obtiene un los datos del test con sus preguntas de manera aleatoria.
        /// </summary>
        /// <param name="idJuegos">El identificador del juego a consultar.</param>
        /// <returns>
        /// Retorna un objeto <see cref="IActionResult"/> con el siguiente comportamiento:
        /// <list type="bullet">
        /// <item><description><c>200 OK</c> si el juego existe y tiene preguntas, devolviendo un objeto <see cref="JuegoConPreguntasDTO"/>.</description></item>
        /// <item><description><c>404 Not Found</c> si el juego no existe o no tiene preguntas.</description></item>
        /// <item><description><c>500 Internal Server Error</c> si ocurre un error de base de datos o un error inesperado.</description></item>
        /// </list>
        /// </returns>
        /// <remarks>
        /// Este endpoint ejecuta el procedimiento almacenado <c>dbo.sp_obtenerDatosTest</c>,
        /// el cual devuelve un JSON con la información del juego y sus preguntas.  
        /// Posteriormente, se deserializa la respuesta al objeto <see cref="JuegoConPreguntasDTO"/>.
        /// </remarks>


        [HttpGet("juegos/{idJuego}")]

        public async Task<IActionResult> GetPreguntasAleatorias(int idJuego)
        {
            try
            {
                // Obtener información del juego
                var juego = await _context.Juegos.FindAsync(idJuego);
                if (juego == null)
                {
                    return NotFound(new { exito = false, mensaje = "Juego no encontrado" });
                }

                // 🔹 Obtener las preguntas del juego con sus respuestas
                var preguntas = await (from pj in _context.PreguntaJuego
                                       join p in _context.Preguntas on pj.IdPregunta equals p.IdPregunta
                                       where pj.IdJuegos == idJuego && p.Activa
                                       select new
                                       {
                                           IdPregunta = p.IdPregunta,
                                           Enunciado = p.Enunciado,
                                           Tipo = p.Tipo,
                                           Activa = p.Activa,
                                           Respuestas = _context.Respuestas
                                               .Where(r => r.IdPregunta == p.IdPregunta)
                                               .Select(r => new
                                               {
                                                   Id = r.Id,
                                                   Texto = r.Texto,
                                                   Es_correcta = r.Es_correcta,
                                                   Retroalimentacion = r.Retroalimentacion
                                               }).ToList()
                                       }).ToListAsync();

                // 🔹 Aleatorizar el orden de las preguntas (no las respuestas)
                var random = new Random();
                preguntas = preguntas.OrderBy(p => random.Next()).ToList();

                // 🔹 Devolver el resultado final
                return Ok(new
                {
                    exito = true,
                    Nombre = juego.Nombre,
                    Descripcion = juego.Descripcion,
                    Detalle = juego.Detalle,
                    Preguntas = preguntas
                });
            }
            catch
            {
                return StatusCode(500, new
                {
                    exito = false,
                    mensaje = "Ocurrió un error al obtener las preguntas",
                });
            }
        }

        // GET: api/Preguntas
        [HttpGet]
        public IEnumerable<Preguntas> Get()
        {
            return _context.Preguntas.ToList();
        }

        [HttpGet("{idPregunta}")]
        public ActionResult<Preguntas> GetById(int idPregunta)
        {
            var pregunta = _context.Preguntas.Find(idPregunta);
            if (pregunta == null)
                return NotFound();
            return pregunta;
        }

        // POST: api/Preguntas
        [HttpPost]
        public ActionResult<Preguntas> Create(Preguntas nuevaPregunta)
        {
            if (nuevaPregunta == null ||
                string.IsNullOrWhiteSpace(nuevaPregunta.Enunciado))
                return BadRequest("La pregunta debe tener un enuncuado.");

            _context.Preguntas.Add(nuevaPregunta);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById),
                new
                {
                    IdPregunta = nuevaPregunta.IdPregunta
                },
                nuevaPregunta);
        }

        // PUT: api/Preguntas/5
        [HttpPut("{idPregunta}")]
        public ActionResult Update(int idPregunta, Preguntas preguntaActualizada)
        {
            var pregunta = _context.Preguntas.Find(idPregunta);
            if (pregunta == null)
                return NotFound();

            pregunta.Enunciado = preguntaActualizada.Enunciado;
            pregunta.Tipo = preguntaActualizada.Tipo;
            pregunta.Activa = preguntaActualizada.Activa;

            _context.SaveChanges();
            return Ok(pregunta);
        }

        [HttpDelete("{idPregunta}")]
        public async Task<IActionResult> Delete(long idPregunta)
        {
            try
            {
                var pregunta = await _context.Preguntas.FindAsync(idPregunta);
                if (pregunta == null)
                    return NotFound();

                _context.Preguntas.Remove(pregunta);
                await _context.SaveChangesAsync();

                return NoContent(); // 204 sin contenido
            }
            catch
            {
                return StatusCode(500); // 500 sin mensaje ni datos
            }
        }


        [HttpPost("juego/{idJuego}/con-respuestas")]

        public async Task<ActionResult> CreateQuestionWithAnswers(
        int idJuego,
        [FromBody] RecibirPreguntaConRespuestasDTO dto)
        {
            try
            {
                // Validaciones básicas
                if (dto == null || string.IsNullOrWhiteSpace(dto.Enunciado))
                    return BadRequest(new { mensaje = "La pregunta debe tener un enunciado." });

                if (dto.Respuestas == null || !dto.Respuestas.Any())
                    return BadRequest(new { mensaje = "Debe agregar al menos una respuesta." });

                if (dto.Enunciado.Length < 1 || dto.Enunciado.Length > 500)
                    return BadRequest(new { mensaje = "El enunciado debe tener entre 1 y 500 caracteres." });

                if (dto.Tipo != "unica" && dto.Tipo != "multiple")
                {
                    return BadRequest(new { mensaje = "El tipo de pregunta debe ser 'unica' o 'multiple'." });
                }


                var enunciadoSeguro = WebUtility.HtmlEncode(dto.Enunciado);

                // Crear la pregunta
                var pregunta = new Preguntas
                {
                    Enunciado = enunciadoSeguro,
                    Tipo = dto.Tipo,
                    Activa = dto.Activa
                };

                await _context.Preguntas.AddAsync(pregunta);
                await _context.SaveChangesAsync(); // genera idPregunta

                // Guardar las respuestas
                var respuestasGuardadas = new List<Respuestas>();
                foreach (var r in dto.Respuestas)
                {
                    var respuesta = new Respuestas
                    {
                        IdPregunta = pregunta.IdPregunta,
                        Texto = WebUtility.HtmlEncode(r.Texto),
                        Es_correcta = r.Es_correcta,
                        Retroalimentacion = WebUtility.HtmlEncode(r.Retroalimentacion)
                    };
                    await _context.Respuestas.AddAsync(respuesta);
                    respuestasGuardadas.Add(respuesta);
                }

                await _context.SaveChangesAsync(); // guardar todas las respuestas

                // Crear la asociación con el juego
                var preguntaJuego = new PreguntaJuego
                {
                    IdPregunta = pregunta.IdPregunta,
                    IdJuegos = idJuego
                };
                await _context.PreguntaJuego.AddAsync(preguntaJuego);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetById),
                    new { IdPregunta = pregunta.IdPregunta },
                    new { Pregunta = pregunta, Respuestas = respuestasGuardadas, Juego = idJuego });
            }
            catch (DbUpdateException)
            {
                // No revelar información sensible de la base de datos
                return StatusCode(500, new { mensaje = "Error al guardar en la base de datos." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { mensaje = "Error inesperado." });
            }
        }


        [HttpGet("pregunta/{idPregunta}/con-respuestas")]
        public ActionResult GetPreguntaConRespuestas(int idPregunta)
        {
            // Obtener la pregunta y sus respuestas directamente
            var preguntaConRespuestas = _context.Preguntas
                .Where(p => p.IdPregunta == idPregunta)
                .Select(p => new
                {
                    Pregunta = p,
                    Respuestas = _context.Respuestas
                        .Where(r => r.IdPregunta == p.IdPregunta)
                        .ToList()
                })
                .FirstOrDefault();

            if (preguntaConRespuestas == null)
                return NotFound(new { mensaje = "Pregunta no encontrada." });

            return Ok(preguntaConRespuestas);
        }



        [HttpPut("con-respuestas/{idPregunta}")]
        public async Task<IActionResult> UpdateQuestionWithAnswersAsync(
            long idPregunta,
            [FromBody] RecibirPreguntaConRespuestasDTO dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Enunciado))
                return BadRequest(new { mensaje = "La pregunta debe tener un enunciado." });

            if (dto.Respuestas == null || !dto.Respuestas.Any())
                return BadRequest(new { mensaje = "Debe incluir al menos una respuesta." });

            if (dto.Tipo != "unica" && dto.Tipo != "multiple")
                return BadRequest(new { mensaje = "El tipo de pregunta debe ser 'unica' o 'multiple'." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pregunta = await _context.Preguntas.FindAsync(idPregunta);
                if (pregunta == null)
                    return NotFound(new { mensaje = "Pregunta no encontrada." });

                // Actualizar datos de la pregunta
                pregunta.Enunciado = dto.Enunciado;
                pregunta.Tipo = dto.Tipo;
                pregunta.Activa = dto.Activa;

                await _context.SaveChangesAsync();

                // Obtener respuestas actuales
                var respuestasExistentes = await _context.Respuestas
                    .Where(r => r.IdPregunta == idPregunta)
                    .ToListAsync();

                // Eliminar respuestas que ya no están en el DTO
                var respuestasAEliminar = respuestasExistentes
                    .Where(r => !dto.Respuestas.Any(x => x.Texto == r.Texto))
                    .ToList();
                _context.Respuestas.RemoveRange(respuestasAEliminar);

                // Actualizar o agregar respuestas
                foreach (var rDto in dto.Respuestas)
                {
                    var respuestaExistente = respuestasExistentes
                        .FirstOrDefault(r => r.Texto == rDto.Texto);

                    if (respuestaExistente != null)
                    {
                        respuestaExistente.Es_correcta = rDto.Es_correcta;
                        respuestaExistente.Retroalimentacion = rDto.Retroalimentacion;
                    }
                    else
                    {
                        var nuevaRespuesta = new Respuestas
                        {
                            IdPregunta = idPregunta,
                            Texto = rDto.Texto,
                            Es_correcta = rDto.Es_correcta,
                            Retroalimentacion = rDto.Retroalimentacion
                        };
                        await _context.Respuestas.AddAsync(nuevaRespuesta);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var respuestasActualizadas = await _context.Respuestas
                    .Where(r => r.IdPregunta == idPregunta)
                    .ToListAsync();

                return Ok(new { Pregunta = pregunta, Respuestas = respuestasActualizadas });
            }
            catch (DbUpdateException dbEx)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { mensaje = "Error al actualizar en la base de datos.", detalle = dbEx.Message });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { mensaje = "Error inesperado.", detalle = ex.Message });
            }
        }





        [HttpPatch("estado/{idPregunta}/{nuevoEstado}")]
        public async Task<IActionResult> CambiarEstadoPregunta(long idPregunta, bool nuevoEstado)
        {
            try
            {
                var pregunta = await _context.Preguntas.FindAsync(idPregunta);
                if (pregunta == null)
                    return NotFound(new { mensaje = "Pregunta no encontrada." });

                pregunta.Activa = nuevoEstado;
                await _context.SaveChangesAsync();

                return Ok(new { mensaje = "Estado actualizado correctamente.", Pregunta = pregunta });
            }
            catch (Exception ex)
            {
                // No exponer detalles sensibles, solo un mensaje genérico
                return StatusCode(500, new { mensaje = "Ocurrió un error al actualizar el estado." });
            }
        }



        [HttpGet("juego/{idJuegos}/con-respuestas")]
        [Authorize]

        public ActionResult GetPreguntasConRespuestasPorJuego(int idJuegos)
        {
            // Primero obtenemos los idPregunta asociados al juego
            var preguntasIds = _context.PreguntaJuego
                .Where(pj => pj.IdJuegos == idJuegos)
                .Select(pj => pj.IdPregunta)
                .ToList();

            // Luego obtenemos las preguntas y sus respuestas
            var resultado = _context.Preguntas
                .Where(p => preguntasIds.Contains(p.IdPregunta))
                .Select(p => new
                {
                    Pregunta = p,
                    Respuestas = _context.Respuestas
                        .Where(r => r.IdPregunta == p.IdPregunta)
                        .ToList()
                })
                .ToList();

            return Ok(resultado);
        }

    }
} // FIN