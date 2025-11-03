namespace APIJuegos.DTOs
{
    public class JuegoDTO
    {
        public int IdJuego { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool Activo { get; set; } = false;
        public int IdTipoJuego { get; set; }
    }
}
