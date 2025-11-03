namespace APIJuegos.Modelos
{
    public class RangoEvaluacion
    {
        public int IdRangoEvaluacion { get; set; }
        public int IdJuego { get; set; }
        public int RangoMinimo { get; set; }
        public int RangoMaximo { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}
