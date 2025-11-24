using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIJuegos.Modelos
{
    [Table("Usuario")]
    public class Usuario
    {
        public int IdUsuario { get; set; }
        public string Correo { get; set; } = string.Empty;

        public byte[] Clave { get; set; } = Array.Empty<byte>();
        public string Salt { get; set; } = string.Empty;

        public int IdRol { get; set; }

        [ForeignKey("IdRol")]
        public Rol? Rol { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public bool Activo { get; set; }
    }
}
