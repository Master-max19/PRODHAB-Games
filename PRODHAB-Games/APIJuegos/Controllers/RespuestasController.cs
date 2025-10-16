using Microsoft.AspNetCore.Mvc;
using APIJuegos.Data;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Cors;


namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]

    public class RespuestasController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public RespuestasController(JuegosProdhabContext context)
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
        public ActionResult<Respuestas> GetById(long idRespuestas)
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
            if (nuevaRespuestas == null || string.IsNullOrWhiteSpace(nuevaRespuestas.Texto))
                return BadRequest("La respuesta debe tener un texto.");

            _context.Respuestas.Add(nuevaRespuestas);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { IdRespuestas = nuevaRespuestas.Id }, nuevaRespuestas);
        }

        // PUT: api/Respuestas/5
        [HttpPut("{idRespuesta}")]
        public ActionResult Update(long id, Respuestas respuestaActualizada)
        {
            var respuesta = _context.Respuestas.Find(id);
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