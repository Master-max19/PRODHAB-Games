using APIJuegos.Data;
using APIJuegos.DTOs;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableCors("FrontWithCookies")]
    public class RespuestaController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public RespuestaController(JuegosProdhabContext context)
        {
            _context = context;
        }

        // GET: api/Respuestas
        [HttpGet]
        public IEnumerable<Respuesta> Get()
        {
            return _context.Respuestas.ToList();
        }

        // GET: api/Respuestas/5
        [HttpGet("{idRespuesta}")]
        public ActionResult<Respuesta> GetById(long idRespuesta)
        {
            var respuesta = _context.Respuestas.Find(idRespuesta);
            if (respuesta == null)
                return NotFound();
            return respuesta;
        }

        // POST: api/Respuestas
        [HttpPost]
        public ActionResult<Respuesta> Create(CrearRespuestaDto nuevaRespuestaDto)
        {
            if (nuevaRespuestaDto == null || string.IsNullOrWhiteSpace(nuevaRespuestaDto.Texto))
                return BadRequest("La respuesta debe tener un texto.");

            // Mapear Dto a entidad, sin asignar IdRespuesta
            var respuestaEntidad = new Respuesta
            {
                IdPregunta = nuevaRespuestaDto.IdPregunta,
                Texto = nuevaRespuestaDto.Texto,
                EsCorrecta = nuevaRespuestaDto.EsCorrecta,
                Retroalimentacion = nuevaRespuestaDto.Retroalimentacion,
            };

            _context.Respuestas.Add(respuestaEntidad);
            _context.SaveChanges();

            return CreatedAtAction(
                nameof(GetById),
                new { IdRespuesta = respuestaEntidad.IdRespuesta },
                respuestaEntidad
            );
        }

        // PUT: api/Respuestas/5
        [HttpPut("{idRespuesta}")]
        public ActionResult Update(long idRespuesta, Respuesta respuestaActualizada)
        {
            var respuesta = _context.Respuestas.Find(idRespuesta);
            if (respuesta == null)
                return NotFound();

            respuesta.IdPregunta = respuestaActualizada.IdPregunta;
            respuesta.Texto = respuestaActualizada.Texto;
            respuesta.Retroalimentacion = respuestaActualizada.Retroalimentacion;

            _context.SaveChanges();
            return Ok(respuesta);
        }

        // DELETE: api/Respuestas/5
        [HttpDelete("{idRespuesta}")]
        public ActionResult Delete(long idRespuesta)
        {
            var respuesta = _context.Respuestas.Find(idRespuesta);
            if (respuesta == null)
                return NotFound();

            _context.Respuestas.Remove(respuesta);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
