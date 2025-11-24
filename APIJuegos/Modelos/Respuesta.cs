using System.Text.Json.Serialization;

namespace APIJuegos.Modelos
{
    public class Respuesta
    {
        public long IdRespuesta { get; set; }
        public long IdPregunta { get; set; }
        public String Texto { get; set; } = String.Empty;
        public bool EsCorrecta { get; set; }
        public String Retroalimentacion { get; set; } = String.Empty;
    }
}
