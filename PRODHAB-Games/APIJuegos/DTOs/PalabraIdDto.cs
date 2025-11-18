namespace APIJuegos.DTOs
{
    /*
    * Incluye los identificadores durante el transporte de las palabras asociadas a un juego. Se
    * utiliza dentro de otro Dto (PalabrasResponseDto).
    */
    public class PalabraIdDto
    {
        public int IdPalabraJuego { get; set; }
        public string Palabra { get; set; } = string.Empty;
    }
}
