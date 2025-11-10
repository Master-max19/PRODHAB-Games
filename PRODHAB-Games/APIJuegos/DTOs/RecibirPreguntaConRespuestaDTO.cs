using System.ComponentModel.DataAnnotations;

namespace APIJuegos.DTOs
{
    public class RecibirPreguntaConRespuestasDto
    {
        public string Enunciado { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public bool Activa { get; set; }
        public List<RespuestaSinIDsDto> Respuestas { get; set; } = new();
    }

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
