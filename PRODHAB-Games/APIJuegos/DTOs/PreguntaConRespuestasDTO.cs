namespace APIJuegos.DTOs
{

    public class PreguntaConRespuestasDTO
    {
        public long IdPregunta { get; set; }
        public string Enunciado { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;  // "unica" o "multiple"
        public bool Activa { get; set; }
        public List<RespuestasDTO> Respuestas { get; set; } = new();
    }

}
