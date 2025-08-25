namespace APIJuegos.Data.Modelos
{
    public class PreguntaConRespuestas : Preguntas
    {
        public List<Respuestas> respuestas { get; set; } = new();
    }
}
