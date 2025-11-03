namespace APIJuegos.DTOs
{
    public class PreguntaConRespuestasDto
    {
        public long IdPregunta { get; set; }
        public string Enunciado { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty; // "unica" o "multiple"
        public bool Activa { get; set; }
        public List<RespuestaDto> Respuestas { get; set; } = new();
    }
}
