using Microsoft.AspNetCore.Mvc;
using APIJuegos.Data;
using APIJuegos.Data.Modelos;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RespuestasController : ControllerBase
    {
    private readonly PracticaJuegosUcrContext _context;

        public RespuestasController(PracticaJuegosUcrContext context)
        {
            _context = context;
        }

        // GET: api/Respuestas
        [HttpGet]
        public IEnumerable<Respuestas> Get()
        {
            return _context.Respuestas.ToList();
        }

        // GET: api/Respuestas/5
        [HttpGet("{idRespuestas}")]
        public ActionResult<Respuestas> GetById(int idRespuestas)
        {
            var respuesta = _context.Respuestas.Find(idRespuestas);
            if (respuesta == null)
                return NotFound();
            return respuesta;
        }

        // POST: api/Respuestas
        [HttpPost]
        public ActionResult<Respuestas> Create(Respuestas nuevaRespuestas)
        {
            if (nuevaRespuestas == null || string.IsNullOrWhiteSpace(nuevaRespuestas.texto))
                return BadRequest("La respuesta debe tener un texto.");

            _context.Respuestas.Add(nuevaRespuestas);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { idRespuestas = nuevaRespuestas.id }, nuevaRespuestas);
        }

        // PUT: api/Respuestas/5
        [HttpPut("{idRespuesta}")]
        public ActionResult Update(int id, Respuestas respuestaActualizada)
        {
            var respuesta = _context.Respuestas.Find(id);
            if (respuesta == null)
                return NotFound();

            respuesta.idPregunta = respuestaActualizada.idPregunta;
            respuesta.texto = respuestaActualizada.texto;
            respuesta.retroalimentacion = respuestaActualizada.retroalimentacion;

            _context.SaveChanges();
            return Ok(respuesta);
        }

        // DELETE: api/Respuestas/5
        [HttpDelete("{idRespuesta}")]
        public ActionResult Delete(int idRespuesta)
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