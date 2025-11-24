namespace APIJuegos.DTOs
{
    /*
    *Utilizado en la clase TestController.
   * DTO utilizado para representar las opciones o respuestas
   * asociadas a una pregunta dentro de un test o juego.
   * Se emplea en la obtención de preguntas aleatorias junto con sus respuestas.
   */
    public class OpcionesTestDto
    {
        public long IdRespuesta { get; set; }
        public long IdPregunta { get; set; }
        public string Texto { get; set; } = string.Empty;
    }
}
