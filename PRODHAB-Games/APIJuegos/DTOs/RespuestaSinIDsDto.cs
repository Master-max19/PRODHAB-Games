using System.ComponentModel.DataAnnotations;

namespace APIJuegos.DTOs
{
    /*Utilizado en RecibirPreguntaConRespuestasDto*/
    public class RespuestaSinIDsDto
    {
        [Required(ErrorMessage = "El texto de la respuesta es obligatorio.")]
        [MaxLength(300, ErrorMessage = "La respuesta no puede tener más de 300 caracteres.")]
        public string Texto { get; set; } = string.Empty;
        public bool EsCorrecta { get; set; }

        [MaxLength(300, ErrorMessage = "La retroalimentación no puede superar los 300 caracteres.")]
        public string Retroalimentacion { get; set; } = string.Empty;
    }
}
