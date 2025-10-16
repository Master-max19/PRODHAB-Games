
using APIJuegos.Modelos;

namespace APIJuegos.DTOs
{

    public class RecibirPreguntaConRespuestasDTO
    {
        public long IdPregunta { get; set; }
        public string Enunciado { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;  // "unica" o "multiple"
        public bool Activa { get; set; }
        public List<Respuestas> Respuestas { get; set; } = new();
    }

}
