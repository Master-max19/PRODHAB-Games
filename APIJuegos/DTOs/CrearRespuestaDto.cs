namespace APIJuegos.DTOs
{
    /**
 * DTO utilizado para crear una nueva respuesta asociada a una pregunta.
 * Contiene la información necesaria para registrar la respuesta en la base de datos.
 */

    public class CrearRespuestaDto
    {
        public long IdPregunta { get; set; }
        public string Texto { get; set; } = string.Empty;
        public bool EsCorrecta { get; set; } = false;
        public string Retroalimentacion { get; set; } = string.Empty;
    }
}
