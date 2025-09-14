using APIJuegos.Data;
using APIJuegos.Data.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace APIJuegos.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    [EnableCors("AllowAll")]

    public class FrutasController : ControllerBase
    {
    private readonly PracticaJuegosUcrContext _context;

        public FrutasController(PracticaJuegosUcrContext context)
        {
            _context = context;
        }

        // GET: api/Frutas
        [HttpGet]
        public IEnumerable<Frutas> Get()
        {
            return _context.Frutas.ToList();
        }

        // GET: api/Frutas/5
        [HttpGet("{idFruta}")]
        public ActionResult<Frutas> GetById(int idFruta)
        {
            var fruta = _context.Frutas.Find(idFruta);
            if (fruta == null)
                return NotFound();
            return fruta;
        }

        // POST: api/Frutas
        [HttpPost]
        public ActionResult<Frutas> Create(Frutas nuevaFruta)
        {
            if (nuevaFruta == null || string.IsNullOrWhiteSpace(nuevaFruta.Nombre))
                return BadRequest("La fruta debe tener un nombre.");

            _context.Frutas.Add(nuevaFruta);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { idFruta = nuevaFruta.IdFruta }, nuevaFruta);
        }

        // PUT: api/Frutas/5
        [HttpPut("{idFruta}")]
        public ActionResult Update(int idFruta, Frutas frutaActualizada)
        {
            var fruta = _context.Frutas.Find(idFruta);
            if (fruta == null)
                return NotFound();

            fruta.Nombre = frutaActualizada.Nombre;
            fruta.Color = frutaActualizada.Color;
            fruta.Precio = frutaActualizada.Precio;
            fruta.Cantidad = frutaActualizada.Cantidad;

            _context.SaveChanges();
            return Ok(fruta);
        }

        // DELETE: api/Frutas/5
        [HttpDelete("{idFruta}")]
        public ActionResult Delete(int idFruta)
        {
            var fruta = _context.Frutas.Find(idFruta);
            if (fruta == null)
                return NotFound();

            _context.Frutas.Remove(fruta);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
