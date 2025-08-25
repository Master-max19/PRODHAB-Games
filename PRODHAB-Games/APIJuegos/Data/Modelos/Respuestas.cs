using System.Text.Json.Serialization;

namespace APIJuegos.Data.Modelos
{
    public class Respuestas
    {
        public long id { get; set; }


        public long idPregunta { get; set; }

        public String texto { get; set; }

        public Boolean es_correcta { get; set; }

        public String retroalimentacion { get; set; }
    }
}