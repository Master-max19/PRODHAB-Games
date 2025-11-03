namespace APIJuegos.DTOs
{
    public class PalabrasRequestDto
    {
        public int IdJuego { get; set; }
        public List<string> Palabras { get; set; } = new();
    }
}
