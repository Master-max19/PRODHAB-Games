using APIJuegos.Data;
using APIJuegos.Data.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.Json;

namespace APIJuegos.Controllers
{

    [ApiController]
    [Route("api/[controller]")]

    [EnableCors("FrontWithCookies")]
    [Authorize]

    public class AdminController : ControllerBase
    {
        private readonly PracticaJuegosUcrContext _context;

        public AdminController(PracticaJuegosUcrContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IEnumerable<Preguntas> Get()
        {
            return _context.Preguntas.ToList();
        }
    }
}