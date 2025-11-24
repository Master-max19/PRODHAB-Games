using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIJuegos.Modelos
{
    [Table("Rol")]
    public class Rol
    {
        [Key]
        public int IdRol { get; set; }
        public string Nombre { get; set; } = string.Empty;

        // Relación uno a muchos (un rol puede tener varios usuarios)
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}
