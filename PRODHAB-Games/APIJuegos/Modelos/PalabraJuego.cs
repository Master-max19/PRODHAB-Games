using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIJuegos.Modelos
{
    [Table("PalabraJuego")]
    public class PalabraJuego
    {
        [Key]
        public int IdPalabraJuego { get; set; }
        public int IdJuego { get; set; }

        [Required]
        [StringLength(255)]
        public string Palabra { get; set; }
        public bool Activa { get; set; } = true;

        [ForeignKey("IdJuego")]
        public Juego Juego { get; set; }
    }
}
