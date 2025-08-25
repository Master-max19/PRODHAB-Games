using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIJuegos.Data.Modelos
{
    public class Frutas
    {
     
        public int IdFruta { get; set; }
        public string Nombre { get; set; }

        public string? Color { get; set; }

        public decimal? Precio { get; set; }

        public int? Cantidad { get; set; }
    }
}
