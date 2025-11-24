using System.Data;
using System.Net;
using System.Text.Json;
using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Helpers;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableCors("FrontWithCookies")]
    public class PreguntaController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public PreguntaController(JuegosProdhabContext context)
        {
            _context = context;
        }

        [HttpGet("{idPregunta}")]
        public ActionResult<Pregunta> GetById(long idPregunta)
        {
            var pregunta = _context.Preguntas.Find(idPregunta);
            if (pregunta == null)
                return NotFound();
            return pregunta;
        }

        [HttpPut("{idPregunta}")]
        public ActionResult Update(long idPregunta, ActualizarPreguntaDto dto)
        {
            var pregunta = _context.Preguntas.Find(idPregunta);
            if (pregunta == null)
                return NotFound();

            // Actualizar solo los campos enviados en el Dto
            if (!string.IsNullOrWhiteSpace(dto.Enunciado))
                pregunta.Enunciado = SanitizeHtmlHelper.Clean(dto.Enunciado);

            if (!string.IsNullOrWhiteSpace(dto.Tipo))
            {
                var tipoNormalizado = dto.Tipo.Trim().ToLower();
                if (tipoNormalizado != "unica" && tipoNormalizado != "multiple")
                    return BadRequest("El tipo debe ser 'unica' o 'multiple'.");
                pregunta.Tipo = SanitizeHtmlHelper.Clean(tipoNormalizado);
            }

            if (dto.Activa.HasValue)
                pregunta.Activa = dto.Activa.Value;

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
            [FromBody] RecibirPreguntaConRespuestasDto dto
        )
        {
            try
            {
                var juego = await _context.Juegos.FindAsync(idJuego);
                if (juego == null)
                    return NotFound(new { exito = false, mensaje = "Test no encontrado" });

                var validacion = ValidarPreguntaConRespuestas(dto);
                if (validacion != null)
                    return validacion;

                var enunciadoSeguro = dto.Enunciado;

                // Crear la pregunta
                var pregunta = new Pregunta
                {
                    Enunciado = SanitizeHtmlHelper.Clean(enunciadoSeguro),
                    Tipo = dto.Tipo,
                    Activa = dto.Activa,
                };

                await _context.Preguntas.AddAsync(pregunta);
                await _context.SaveChangesAsync(); // genera idPregunta

                // Guardar las respuestas
                var respuestasGuardadas = new List<Respuesta>();
                foreach (var r in dto.Respuestas)
                {
                    var respuesta = new Respuesta
                    {
                        IdPregunta = pregunta.IdPregunta,
                        Texto = SanitizeHtmlHelper.Clean(r.Texto),
                        EsCorrecta = r.EsCorrecta,
                        Retroalimentacion = SanitizeHtmlHelper.Clean(r.Retroalimentacion),
                    };
                    await _context.Respuestas.AddAsync(respuesta);
                    respuestasGuardadas.Add(respuesta);
                }

                await _context.SaveChangesAsync(); // guardar todas las respuestas

                // Crear la asociación con el juego
                var preguntaJuego = new PreguntaJuego
                {
                    IdPregunta = pregunta.IdPregunta,
                    IdJuego = idJuego,
                };
                await _context.PreguntaJuegos.AddAsync(preguntaJuego);
                await _context.SaveChangesAsync();

                return CreatedAtAction(
                    nameof(GetById),
                    new { IdPregunta = pregunta.IdPregunta },
                    new
                    {
                        Pregunta = pregunta,
                        Respuestas = respuestasGuardadas,
                        Juego = idJuego,
                    }
                );
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, new { mensaje = "Error al guardar en la base de datos." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { mensaje = "Error inesperado." });
            }
        }

        [HttpGet("pregunta/{idPregunta}/con-respuestas")]
        public ActionResult<object> GetPreguntaConRespuestas(int idPregunta)
        {
            var preguntaConRespuestas = _context
                .Preguntas.Where(p => p.IdPregunta == idPregunta)
                .Select(p => new
                {
                    Pregunta = p,
                    Respuestas = _context
                        .Respuestas.Where(r => r.IdPregunta == p.IdPregunta)
                        .ToList(),
                })
                .FirstOrDefault();

            if (preguntaConRespuestas == null)
                return NotFound(new { mensaje = "Pregunta no encontrada." });

            return Ok(preguntaConRespuestas);
        }

        [HttpPut("con-respuestas/{idPregunta}")]
        public async Task<IActionResult> UpdateQuestionWithAnswersAsync(
            long idPregunta,
            [FromBody] RecibirPreguntaConRespuestasDto dto
        )
        {
            var validacion = ValidarPreguntaConRespuestas(dto);
            if (validacion != null)
                return validacion;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pregunta = await _context.Preguntas.FindAsync(idPregunta);
                if (pregunta == null)
                    return NotFound(new { mensaje = "Pregunta no encontrada." });

                pregunta.Enunciado = SanitizeHtmlHelper.Clean(dto.Enunciado);
                pregunta.Tipo = dto.Tipo;
                pregunta.Activa = dto.Activa;

                await _context.SaveChangesAsync();

                // Obtener respuestas actuales
                var respuestasExistentes = await _context
                    .Respuestas.Where(r => r.IdPregunta == idPregunta)
                    .ToListAsync();

                // Eliminar respuestas que ya no están en el Dto
                var respuestasAEliminar = respuestasExistentes
                    .Where(r => !dto.Respuestas.Any(x => x.Texto == r.Texto))
                    .ToList();
                _context.Respuestas.RemoveRange(respuestasAEliminar);

                // Actualizar o agregar respuestas
                foreach (var rDto in dto.Respuestas)
                {
                    var respuestaExistente = respuestasExistentes.FirstOrDefault(r =>
                        r.Texto == rDto.Texto
                    );

                    if (respuestaExistente != null)
                    {
                        respuestaExistente.EsCorrecta = rDto.EsCorrecta;
                        respuestaExistente.Retroalimentacion = SanitizeHtmlHelper.Clean(
                            rDto.Retroalimentacion
                        );
                    }
                    else
                    {
                        var nuevaRespuesta = new Respuesta
                        {
                            IdPregunta = idPregunta,
                            Texto = SanitizeHtmlHelper.Clean(rDto.Texto),
                            EsCorrecta = rDto.EsCorrecta,
                            Retroalimentacion = SanitizeHtmlHelper.Clean(rDto.Retroalimentacion),
                        };
                        await _context.Respuestas.AddAsync(nuevaRespuesta);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var respuestasActualizadas = await _context
                    .Respuestas.Where(r => r.IdPregunta == idPregunta)
                    .ToListAsync();

                return Ok(new { Pregunta = pregunta, Respuestas = respuestasActualizadas });
            }
            catch (DbUpdateException)
            {
                await transaction.RollbackAsync();
                return StatusCode(
                    500,
                    new { mensaje = "Error al actualizar en la base de datos." }
                );
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { mensaje = "Error inesperado." });
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

                return Ok(
                    new { mensaje = "Estado actualizado correctamente.", Pregunta = pregunta }
                );
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new { mensaje = "Ocurrió un error al actualizar el estado." }
                );
            }
        }

        private ActionResult? ValidarPreguntaConRespuestas(RecibirPreguntaConRespuestasDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Enunciado))
                return BadRequest(new { mensaje = "La pregunta debe tener un enunciado." });

            if (dto.Respuestas == null || !dto.Respuestas.Any())
                return BadRequest(new { mensaje = "Debe agregar al menos una respuesta." });

            if (dto.Enunciado.Length < 1 || dto.Enunciado.Length > 500)
                return BadRequest(
                    new { mensaje = "El enunciado debe tener entre 1 y 500 caracteres." }
                );

            if (dto.Tipo != "unica" && dto.Tipo != "multiple")
                return BadRequest(
                    new { mensaje = "El tipo de pregunta debe ser 'unica' o 'multiple'." }
                );

            int totalCorrectas = dto.Respuestas.Count(r => r.EsCorrecta);

            if (dto.Tipo == "unica" && totalCorrectas != 1)
                return BadRequest(
                    new
                    {
                        mensaje = "Las preguntas de tipo 'unica' deben tener exactamente una respuesta correcta.",
                    }
                );

            if (dto.Tipo == "multiple" && totalCorrectas < 1)
                return BadRequest(
                    new
                    {
                        mensaje = "Las preguntas de tipo 'multiple' deben tener al menos una respuesta correcta.",
                    }
                );

            return null; // Todo OK
        }
    }
}
