namespace APIJuegos.Modelos
{
    public class RangoEvaluacion
    {
        public int Id { get; set; }
        public int IdJuegos { get; set; }
        public int RangoMinimo { get; set; }
        public int RangoMaximo { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
