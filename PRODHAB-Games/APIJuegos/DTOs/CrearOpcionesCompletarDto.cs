namespace APIJuegos.DTOs
{
    /**
     * DTO utilizado para recibir las opciones de respuesta
     * en preguntas del tipo “completar”.
     */

    public class CrearOpcionesCompletarDto
    {
        public List<string> Respuestas { get; set; } = new(); // lista de palabras a registrar
    }
}
