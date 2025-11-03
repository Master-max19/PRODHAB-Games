namespace APIJuegos.DTOs
{
    public class PalabraIdDto
    {
        public int IdPalabraJuego { get; set; }
        public string Palabra { get; set; }
    }

    public class PalabrasResponseDto
    {
        public string Mensaje { get; set; }
        public int Total { get; set; }
        public List<PalabraIdDto> Palabras { get; set; } = new List<PalabraIdDto>();
    }
}
