namespace APIJuegos.DTOs
{
    /**
  * DTO utilizado para enviar la respuesta del registro de palabras.
  * Contiene un mensaje informativo, el total de palabras registradas
  * y la lista de palabras con sus identificadores.
  * Se utiliza en PalabraJuegoController.
  */
    public class PalabrasResponseDto
    {
        public string Mensaje { get; set; } = "";
        public int Total { get; set; }
        public List<PalabraIdDto> Palabras { get; set; } = new List<PalabraIdDto>();
    }
}
