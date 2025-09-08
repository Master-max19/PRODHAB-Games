namespace APIJuegos.Data.Modelos
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Correo { get; set; } = string.Empty;

        // 🔹 Contraseña y salt (hash seguro)
        public byte[] Clave { get; set; }
        public string Salt { get; set; } = string.Empty;

        // 🔹 Relación con Rol (FK)
        public int RolId { get; set; }
        public Rol Rol { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;
    }
}
