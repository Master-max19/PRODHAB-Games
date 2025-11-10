namespace APIJuegos.DTOs
{
    public class OpcionesTestDto
    {
        public long IdRespuesta { get; set; }
        public long IdPregunta { get; set; } // Necesario para agrupar
        public string Texto { get; set; } = string.Empty;
    }
}
