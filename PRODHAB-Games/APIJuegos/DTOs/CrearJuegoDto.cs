namespace APIJuegos.DTOs
{
    public class CrearJuegoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool Activo { get; set; } = true; // al crear, normalmente activo por defecto
        public int IdTipoJuego { get; set; } // referencia al tipo de juego
    }
}
