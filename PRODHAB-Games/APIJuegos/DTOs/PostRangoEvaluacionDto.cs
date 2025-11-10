namespace APIJuegos.DTOs
{
    public class PostRangoEvaluacionDto
    {
        public int RangoMinimo { get; set; }
        public int RangoMaximo { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
