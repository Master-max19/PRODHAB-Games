namespace APIJuegos.DTOs
{
    public class CrearRespuestaDto
    {
        public long IdPregunta { get; set; } // Necesario para relacionar con la pregunta
        public string Texto { get; set; } = string.Empty;
        public bool EsCorrecta { get; set; } = false;
        public string Retroalimentacion { get; set; } = string.Empty;
    }
}
