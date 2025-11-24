namespace APIJuegos.Modelos
{
    public class Pregunta
    {
        public long IdPregunta { get; set; }
        public String Enunciado { get; set; } = String.Empty;
        public String Tipo { get; set; } = String.Empty;
        public Boolean Activa { get; set; } = true;
    }
}
