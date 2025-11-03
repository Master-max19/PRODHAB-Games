namespace APIJuegos.DTOs
{
    public class JuegoConPreguntasDto
    {
        public int IdJuego { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Detalle { get; set; } = string.Empty;
        public List<PreguntaConRespuestasDto> Preguntas { get; set; } = new();
    }
}
