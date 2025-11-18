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
    [Route("api/completar-texto")]
    [Authorize]
    [EnableCors("FrontWithCookies")]
    public class CompletarTextoController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public CompletarTextoController(JuegosProdhabContext context)
        {
            _context = context;
        }

        /**
        Las preguntas contiene el texto (texto = pregunta.Enunciado)
        Las respuesta son las palabras a completar como opción (palabras = respuestas.Texto)
        */

        [HttpGet("{idJuego}")]
        [AllowAnonymous]
        [EnableCors("AllowAll")]
        public async Task<IActionResult> GetCompletarTexto(int idJuego)
        {
            try
            {
                if (idJuego <= 0)
                    return BadRequest(new { exito = false, mensaje = "ID de juego inválido" });

                var juego = await _context.Juegos.FindAsync(idJuego);
                if (juego == null)
                    return NotFound(new { exito = false, mensaje = "Juego no encontrado" });

                var preguntasBase = await (
                    from pj in _context.PreguntaJuegos
                    join p in _context.Preguntas on pj.IdPregunta equals p.IdPregunta
                    where pj.IdJuego == idJuego && p.Activa
                    orderby pj.IdPregunta
                    select new { p.Enunciado, p.IdPregunta }
                ).ToListAsync();

                if (!preguntasBase.Any())
                    return Ok(
                        new
                        {
                            exito = true,
                            nombre = juego.Nombre,
                            preguntas = new List<object>(),
                        }
                    );

                var idsPreguntas = preguntasBase.Select(p => p.IdPregunta).ToList();

                var respuestasMap = (
                    await _context
                        .Respuestas.Where(r => idsPreguntas.Contains(r.IdPregunta))
                        .Select(r => new { r.IdPregunta, r.Texto })
                        .ToListAsync()
                )
                    .GroupBy(r => r.IdPregunta)
                    .ToDictionary(g => g.Key, g => g.Select(r => r.Texto).ToList());

                var rondas = preguntasBase
                    .Select(p => new
                    {
                        texto = p.Enunciado,
                        palabras = respuestasMap.ContainsKey(p.IdPregunta)
                            ? respuestasMap[p.IdPregunta]
                            : new List<string>(),
                    })
                    .ToList();

                return Ok(
                    new
                    {
                        exito = true,
                        nombre = juego.Nombre,
                        descripcion = juego.Descripcion,
                        detalle = juego.Descripcion,
                        rondas,
                    }
                );
            }
            catch
            {
                return StatusCode(
                    500,
                    new { exito = false, mensaje = "Ocurrió un error al obtener las rondas" }
                );
            }
        }

        [HttpGet("admin/{idJuego}")]
        public async Task<IActionResult> GetCompletarTextoAdmin(int idJuego)
        {
            try
            {
                if (idJuego <= 0)
                    return BadRequest(new { exito = false, mensaje = "ID de juego inválido" });

                var juego = await _context.Juegos.FindAsync(idJuego);
                if (juego == null)
                    return NotFound(new { exito = false, mensaje = "Juego no encontrado" });

                var preguntasBase = await (
                    from pj in _context.PreguntaJuegos
                    join p in _context.Preguntas on pj.IdPregunta equals p.IdPregunta
                    where pj.IdJuego == idJuego && p.Activa
                    select new { p.IdPregunta, Enunciado = p.Enunciado ?? "" }
                ).ToListAsync();

                if (!preguntasBase.Any())
                    return Ok(
                        new
                        {
                            exito = true,
                            nombre = juego.Nombre,
                            descripcion = juego.Descripcion ?? "",
                            detalle = juego.Detalle ?? "",
                            rondas = new List<object>(),
                        }
                    );

                var idsPreguntas = preguntasBase.Select(p => p.IdPregunta).ToList();

                var todasRespuestas = await _context
                    .Respuestas.Where(r => idsPreguntas.Contains(r.IdPregunta))
                    .Select(r => new
                    {
                        r.IdPregunta,
                        r.IdRespuesta,
                        Texto = r.Texto ?? "",
                    })
                    .ToListAsync();

                var respuestasMap = todasRespuestas
                    .GroupBy(r => r.IdPregunta)
                    .ToDictionary(
                        g => g.Key,
                        g =>
                            g.Select(r => new RondaCompletarDto
                                {
                                    IdRespuesta = r.IdRespuesta,
                                    Texto = r.Texto,
                                })
                                .ToList()
                    );

                // Construir la lista final de preguntas con sus palabras
                var rondas = preguntasBase
                    .Select(p => new
                    {
                        idPregunta = p.IdPregunta,
                        texto = p.Enunciado,
                        palabras = respuestasMap.ContainsKey(p.IdPregunta)
                            ? respuestasMap[p.IdPregunta]
                            : new List<RondaCompletarDto>(),
                    })
                    .ToList();

                return Ok(
                    new
                    {
                        exito = true,
                        nombre = juego.Nombre,
                        descripcion = juego.Descripcion ?? "",
                        detalle = juego.Detalle ?? "",
                        rondas,
                    }
                );
            }
            catch
            {
                return StatusCode(
                    500,
                    new { exito = false, mensaje = "Ocurrió un error al obtener las rondas" }
                );
            }
        }

        [HttpDelete("ronda/{idPregunta}")]
        public async Task<IActionResult> BorrarRonda(long idPregunta)
        {
            var pregunta = await _context.Preguntas.FindAsync(idPregunta);
            if (pregunta == null)
                return NotFound();

            _context.Preguntas.Remove(pregunta);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("opcion-completar/{idRespuesta}")]
        public async Task<IActionResult> BorrarOpcionCompletar(long idRespuesta)
        {
            var respuesta = await _context.Respuestas.FindAsync(idRespuesta);
            if (respuesta == null)
                return NotFound();

            _context.Respuestas.Remove(respuesta);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("crear-ronda/{idJuego}")]
        public async Task<ActionResult> CrearRonda(
            int idJuego,
            [FromBody] EnviarEnunciadoRondaDto dto
        )
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Enunciado))
                return BadRequest(new { exito = false, mensaje = "El enunciado es obligatorio." });

            var juego = await _context.Juegos.FindAsync(idJuego);
            if (juego == null)
                return NotFound(new { exito = false, mensaje = "Juego no encontrado" });

            if (dto.Enunciado.Length > 600)
                return BadRequest(
                    new
                    {
                        exito = false,
                        mensaje = "El enunciado no debe superar los 600 caracteres.",
                    }
                );

            var enunciadoSeguro = SanitizeHtmlHelper.Clean(dto.Enunciado);

            var pregunta = new Pregunta
            {
                Enunciado = enunciadoSeguro,
                Tipo = "multiple",
                Activa = true,
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.Preguntas.AddAsync(pregunta);
                await _context.SaveChangesAsync();

                var preguntaJuego = new PreguntaJuego
                {
                    IdPregunta = pregunta.IdPregunta,
                    IdJuego = idJuego,
                };
                await _context.PreguntaJuegos.AddAsync(preguntaJuego);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(
                    new
                    {
                        exito = true,
                        mensaje = "Pregunta creada correctamente",
                        pregunta = new
                        {
                            IdPregunta = pregunta.IdPregunta,
                            pregunta.Enunciado,
                            pregunta.Tipo,
                            pregunta.Activa,
                        },
                    }
                );
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(
                    500,
                    new { exito = false, mensaje = "Ocurrió un error al crear la pregunta." }
                );
            }
        }

        /**
         * Endpoint utilizado para crear las opciones (palabras) asociadas a una pregunta
         * del tipo “completar”. Valida que la pregunta exista, que las palabras no sean
         * vacías ni contengan espacios, y que no superen los 50 caracteres.
         *
         * @param idPregunta Identificador de la pregunta a la cual se agregarán las opciones.
         * @param dto Objeto con la lista de palabras a registrar.
         * @return Retorna un resultado indicando si la operación fue exitosa o no.
         */

        [HttpPost("opciones/{idPregunta}")]
        public async Task<ActionResult> CrearPalabras(
            long idPregunta,
            [FromBody] CrearOpcionesCompletarDto dto
        )
        {
            var pregunta = await _context.Preguntas.FindAsync(idPregunta);
            if (pregunta == null)
                return NotFound(new { exito = false, mensaje = "Pregunta no encontrada" });

            if (dto.Respuestas == null || !dto.Respuestas.Any())
                return BadRequest(
                    new { exito = false, mensaje = "Debe enviar al menos una palabra" }
                );

            var respuestasNuevas = new List<Respuesta>();

            foreach (var palabraOriginal in dto.Respuestas)
            {
                var palabra = palabraOriginal.Trim();

                if (string.IsNullOrWhiteSpace(palabra))
                    return BadRequest(
                        new { exito = false, mensaje = "No se permiten palabras vacías" }
                    );

                if (palabra.Length > 50)
                    return BadRequest(
                        new
                        {
                            exito = false,
                            mensaje = $"La palabra '{palabra}' excede los 50 caracteres",
                        }
                    );

                if (palabra.Contains(" "))
                    return BadRequest(
                        new
                        {
                            exito = false,
                            mensaje = $"La palabra '{palabra}' no puede contener espacios",
                        }
                    );

                respuestasNuevas.Add(
                    new Respuesta
                    {
                        IdPregunta = idPregunta,
                        Texto = SanitizeHtmlHelper.Clean(palabra),
                        EsCorrecta = true,
                        Retroalimentacion = "",
                    }
                );
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await _context.Respuestas.AddRangeAsync(respuestasNuevas);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(
                    new
                    {
                        exito = true,
                        mensaje = "Opciones creadas correctamente",
                        ids = respuestasNuevas.Select(r => r.IdRespuesta),
                    }
                );
            }
            catch
            {
                await transaction.RollbackAsync();
                return StatusCode(
                    500,
                    new { exito = false, mensaje = "Ocurrió un error al guardar las palabras" }
                );
            }
        }

        [HttpPatch("{idRonda}")]
        public ActionResult ActualizarEnunciadoRonda(
            long idRonda,
            [FromBody] EnviarEnunciadoRondaDto rondaActualizada
        )
        {
            var ronda = _context.Preguntas.Find(idRonda);
            if (ronda == null)
                return NotFound(new { exito = false, mensaje = "La ronda no existe." });

            if (rondaActualizada.Enunciado != null)
            {
                string enunciado = rondaActualizada.Enunciado;

                if (enunciado.Length > 600)
                    return BadRequest(
                        new
                        {
                            exito = false,
                            mensaje = "El enunciado no debe superar los 600 caracteres.",
                        }
                    );

                ronda.Enunciado = SanitizeHtmlHelper.Clean(enunciado);
            }

            _context.SaveChanges();
            return Ok(ronda);
        }
    }
}
