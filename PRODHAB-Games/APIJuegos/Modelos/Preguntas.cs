namespace APIJuegos.Modelos
{
    public class Preguntas
    {
        public long IdPregunta { get; set; }
        public String Enunciado { get; set; } = String.Empty;
        public String Tipo { get; set; } = String.Empty;
        public Boolean Activa { get; set; } = false;
    }
}
