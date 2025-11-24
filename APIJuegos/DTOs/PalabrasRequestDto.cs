namespace APIJuegos.DTOs
{
    /*
   *
   * DTO utilizado para recibir una lista de palabras
   * que serán registradas en un juego específico.
   * Se emplea en el endpoint que permite crear múltiples palabras a la vez.
   * Se utiliza en PalabraJuegoController.
   */
    public class PalabrasRequestDto
    {
        public List<string> Palabras { get; set; } = new();
    }
}
