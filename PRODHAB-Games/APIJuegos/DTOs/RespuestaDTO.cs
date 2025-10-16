using System.Text.Json.Serialization;

namespace APIJuegos.DTOs
{
    public class RespuestasDTO
    {
        public long Id { get; set; }
        public long IdPregunta { get; set; }
        public String Texto { get; set; } = String.Empty;
        public String Retroalimentacion { get; set; } = String.Empty;
    }
}