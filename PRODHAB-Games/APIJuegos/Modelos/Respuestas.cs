using System.Text.Json.Serialization;

namespace APIJuegos.Modelos
{
    public class Respuestas
    {
        public long Id { get; set; }
        public long IdPregunta { get; set; }
        public String Texto { get; set; } = String.Empty;
        public bool Es_correcta { get; set; }
        public String Retroalimentacion { get; set; } = String.Empty;
    }
}
