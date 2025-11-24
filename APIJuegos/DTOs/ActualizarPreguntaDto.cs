namespace APIJuegos.DTOs
{
    /// <summary>
    /// Utilizado en <c>PreguntaController</c> para omitir la clave <c>idPregunta</c>
    /// al enviar el cuerpo (body) en formato JSON.
    /// </summary>
    public class ActualizarPreguntaDto
    {
        public string Enunciado { get; set; } = string.Empty;
        public string? Tipo { get; set; }
        public Boolean? Activa { get; set; }
    }
}
