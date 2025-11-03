using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace APIJuegos.Modelos
{
    [Table("Usuario")]
    public class Usuario
    {
        public int IdUsuario { get; set; }
        public string Correo { get; set; } = string.Empty;

        // 🔹 Contraseña y salt (hash seguro)
        public byte[] Clave { get; set; }
        public string Salt { get; set; } = string.Empty;

        // 🔹 Relación con Rol (FK)
        public int IdRol { get; set; }

        [ForeignKey("IdRol")] // 🔹 Indica que esta propiedad FK se usa para Rol
        public Rol Rol { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public bool Activo { get; set; }
    }
}
