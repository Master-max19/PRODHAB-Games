using System.ComponentModel.DataAnnotations;

namespace APIJuegos.DTOs
{
    /*
    * Utilizado en PreguntaController y utiliza para recibir 
    * las preguntas con respuestas en el momento que se crea una
    * pregunta nueva en el test.
    */
    public class RecibirPreguntaConRespuestasDto
    {
        public string Enunciado { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public bool Activa { get; set; }
        public List<RespuestaSinIDsDto> Respuestas { get; set; } = new();
    }
}
