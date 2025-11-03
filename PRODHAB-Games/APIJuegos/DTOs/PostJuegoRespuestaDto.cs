namespace APIJuegos.DTOs
{
    public class PostJuegoRespuestaDto
    {
        public int IdJuego { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool Activo { get; set; }
        public int IdTipoJuego { get; set; }
    }
}
