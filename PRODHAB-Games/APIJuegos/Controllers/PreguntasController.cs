using APIJuegos.Data;

using APIJuegos.Data.Modelos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json;

//John--------------------------------------------------
using Microsoft.AspNetCore.Authorization;
//---------------------------------------------------

namespace APIJuegos.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PreguntasController : ControllerBase
    {
    private readonly PracticaJuegosUcrContext _context;

        public PreguntasController(PracticaJuegosUcrContext context)
        {
            _context = context;
        }

 


 [HttpGet("aleatorias")]
public async Task<IActionResult> GetPreguntasAleatorias([FromQuery] int cantidad)
{
    using var con = new SqlConnection(_context.Database.GetDbConnection().ConnectionString);
    await con.OpenAsync();

    using var cmd = new SqlCommand("dbo.sp_PreguntasAleatoriasConRespuestas", con);
    cmd.CommandType = CommandType.StoredProcedure;
    cmd.Parameters.AddWithValue("@cantidad", cantidad);

    using var reader = await cmd.ExecuteReaderAsync();
    var preguntas = new List<object>(); // lista de objetos para devolver

    while (await reader.ReadAsync())
    {
        var idPregunta = (long)reader["idPregunta"];
        var enunciado = (string)reader["enunciado"];
        var tipo = (string)reader["tipo"];
        var activa = (bool)reader["activa"];
        var respuestasJson = reader["respuestas"] as string;

        var respuestas = string.IsNullOrEmpty(respuestasJson)
            ? new List<Respuestas>()
            : JsonSerializer.Deserialize<List<Respuestas>>(respuestasJson) ?? new List<Respuestas>();

        var respuestasFiltradas = respuestas.Select(r => new
        {
            r.id,
            r.texto,
            r.es_correcta,
            r.retroalimentacion
        }).ToList();

        preguntas.Add(new
        {
            idPregunta,
            enunciado,
            tipo,
            activa,
            respuestas = respuestasFiltradas
        });
    }

    return Ok(preguntas);
}






        // GET: api/Preguntas
        [HttpGet]
        public IEnumerable<Preguntas> Get()
        {
            return _context.Preguntas.ToList();
        }

        // GET: api/Frutas/5
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
            if (nuevaPregunta == null || string.IsNullOrWhiteSpace(nuevaPregunta.enunciado))
                return BadRequest("La pregunta debe tener un enuncuado.");

            _context.Preguntas.Add(nuevaPregunta);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { idPregunta = nuevaPregunta.idPregunta }, nuevaPregunta);
        }

        // PUT: api/Preguntas/5
        [HttpPut("{idPregunta}")]
        public ActionResult Update(int idPregunta, Preguntas preguntaActualizada)
        {
            var pregunta = _context.Preguntas.Find(idPregunta);
            if (pregunta == null)
                return NotFound();

            pregunta.enunciado = preguntaActualizada.enunciado;
            pregunta.tipo = preguntaActualizada.tipo;
            pregunta.activa = preguntaActualizada.activa;

            _context.SaveChanges();
            return Ok(pregunta);
        }

        // DELETE: api/Frutas/5
        [HttpDelete("{idPregunta}")]
        public ActionResult Delete(int idPregunta)
        {
            var pregunta = _context.Preguntas.Find(idPregunta);
            if (pregunta == null)
                return NotFound();

            _context.Preguntas.Remove(pregunta);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
