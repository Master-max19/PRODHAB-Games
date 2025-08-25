using Microsoft.AspNetCore.Mvc;
using APIJuegos.Data;
using APIJuegos.Data.Modelos;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JuegosController : ControllerBase
    {
        private readonly PracticaJuegosUcrContext _context;

public JuegosController(PracticaJuegosUcrContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IEnumerable<Juegos> Get()
        {
            return _context.Juegos.ToList();
        }

        [HttpGet("{idJuegos}")]
        public ActionResult<Juegos> GetById(int idJuegos)
        {
            var juego = _context.Juegos.Find(idJuegos); 
            if (juego == null)
                return NotFound();
            return juego;
        }

        [HttpDelete("{idJuegos}")]
        public ActionResult Delete(int idJuegos)
        {
            var juego = _context.Juegos.Find(idJuegos);
            if (juego == null)
                return NotFound();

            _context.Juegos.Remove(juego);
            _context.SaveChanges();

            return NoContent();
        }

        [HttpPut("{idJuegos}")]
        public ActionResult Update(int idJuegos, Juegos juegoActualizado)
        {
            var juego = _context.Juegos.Find(idJuegos);
            if (juego == null)
                return NotFound();

            juego.Nombre = juegoActualizado.Nombre;

            _context.SaveChanges();

            return Ok(juego);
        }

        [HttpPost]
        public ActionResult<Juegos> Create(Juegos nuevoJuego)
        {
            if (nuevoJuego == null || string.IsNullOrWhiteSpace(nuevoJuego.Nombre))
                return BadRequest("El juego debe tener un nombre.");

            _context.Juegos.Add(nuevoJuego);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { idJuegos = nuevoJuego.IdJuegos }, nuevoJuego);
        }
    }
}
