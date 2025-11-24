using System.Text.Json.Serialization;

namespace APIJuegos.DTOs
{
    /*Para la creaci+ón de una nueva respuesta en RespuestaController.*/
    public class RespuestaDto
    {
        public long IdRespuesta { get; set; }
        public long IdPregunta { get; set; }
        public String Texto { get; set; } = String.Empty;
        public String Retroalimentacion { get; set; } = String.Empty;
    }
}
