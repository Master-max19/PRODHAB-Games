namespace APIJuegos.Data.Modelos
{
    public class Usuarios
    {
        public int Id { get; set; }
        public string Correo { get; set; } = string.Empty;

        // 🔹 Contraseña y salt (hash seguro)
        public byte[] Clave { get; set; }
        public string Salt { get; set; } = string.Empty;

        // 🔹 Relación con Rol (FK)
        public int RolId { get; set; }
        public Roles Rol { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public bool Activo { get; set; }
    }
}
