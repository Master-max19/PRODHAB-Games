using System.Data;
using System.Net;
using System.Text.Json;
using APIJuegos.Data;
using APIJuegos.DTOs;
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

                // Obtener preguntas activas
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

                // Obtener todas las respuestas y agrupar por IdPregunta
                var respuestasMap = (
                    await _context
                        .Respuestas.Where(r => idsPreguntas.Contains(r.IdPregunta))
                        .Select(r => new { r.IdPregunta, r.Texto })
                        .ToListAsync()
                )
                    .GroupBy(r => r.IdPregunta)
                    .ToDictionary(g => g.Key, g => g.Select(r => r.Texto).ToList());

                // Construir lista final de preguntas con sus respuestas
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

                // Obtener preguntas activas para completar
                var preguntasBase = await (
                    from pj in _context.PreguntaJuegos
                    join p in _context.Preguntas on pj.IdPregunta equals p.IdPregunta
                    where pj.IdJuego == idJuego && p.Activa
                    select new
                    {
                        p.IdPregunta,
                        Enunciado = p.Enunciado ?? "", // evita null
                    }
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

                // Obtener las palabras/respuestas para cada pregunta, manejando nulls
                var todasRespuestas = await _context
                    .Respuestas.Where(r => idsPreguntas.Contains(r.IdPregunta))
                    .Select(r => new
                    {
                        r.IdPregunta,
                        r.IdRespuesta,
                        Texto = r.Texto ?? "",
                    })
                    .ToListAsync();

                // Agrupar por IdPregunta y mapear a RondaCompletarDto
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

        [HttpDelete("opcion-completar{idRespuesta}")]
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

        public async Task<ActionResult> CrearRonda(int idJuego, [FromBody] CrearRondaDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Enunciado))
                return BadRequest(new { exito = false, mensaje = "El enunciado es obligatorio." });

            if (dto.Enunciado.Length > 500)
                return BadRequest(
                    new
                    {
                        exito = false,
                        mensaje = "El enunciado no debe superar los 500 caracteres.",
                    }
                );

            var enunciadoSeguro = dto.Enunciado;

            var pregunta = new Pregunta
            {
                Enunciado = enunciadoSeguro,
                Tipo = "multiple",
                Activa = true,
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Guardar la pregunta y generar IdPregunta
                await _context.Preguntas.AddAsync(pregunta);
                await _context.SaveChangesAsync();

                // Asociar con el juego
                var preguntaJuego = new PreguntaJuego
                {
                    IdPregunta = pregunta.IdPregunta,
                    IdJuego = idJuego,
                };
                await _context.PreguntaJuegos.AddAsync(preguntaJuego);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Devolver el Id generado junto con los demás campos
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
                        Texto = palabra,
                        EsCorrecta = true, // por defecto
                        Retroalimentacion = "", // opcional, vacío
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

        [HttpPut("{idRonda}")]
        public ActionResult ActualizarDetalleRonda(
            long idRonda,
            [FromBody] Pregunta rondaActualizada
        )
        {
            var ronda = _context.Preguntas.Find(idRonda);
            if (ronda == null)
                return NotFound("La ronda no existe.");

            if (rondaActualizada.Enunciado != null)
            {
                string limpio = rondaActualizada.Enunciado;

                if (limpio.Length > 500)
                    return BadRequest("El enunciado no puede tener más de 500 caracteres.");

                ronda.Enunciado = limpio;
            }

            if (!string.IsNullOrWhiteSpace(rondaActualizada.Tipo))
                ronda.Tipo = rondaActualizada.Tipo;

            ronda.Activa = true;

            _context.SaveChanges();
            return Ok(ronda);
        }
    }
}
