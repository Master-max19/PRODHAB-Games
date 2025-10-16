using APIJuegos.Data;
using APIJuegos.Modelos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;


namespace APIJuegos.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("FrontWithCookies")]
    [Authorize]

    public class AdminController : ControllerBase
    {
        private readonly JuegosProdhabContext _context;

        public AdminController(JuegosProdhabContext context)
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