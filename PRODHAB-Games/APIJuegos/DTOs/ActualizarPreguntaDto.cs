namespace APIJuegos.DTOs
{
    public class ActualizarPreguntaDto
    {
        public string Enunciado { get; set; } = string.Empty;
        public string? Tipo { get; set; }
        public Boolean? Activa { get; set; } // opcional para actualización parcial
    }
}
