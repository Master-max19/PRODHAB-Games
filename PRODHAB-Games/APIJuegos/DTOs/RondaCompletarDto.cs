namespace APIJuegos.DTOs
{
    /*
    * Dto para crear una nueva ronda de completarTexto, el texto es equivalente al enunciado de la ronda.
    */
    public class RondaCompletarDto
    {
        public long IdRespuesta { get; set; }
        public string Texto { get; set; } = string.Empty;
    }
}
