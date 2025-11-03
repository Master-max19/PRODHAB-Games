namespace APIJuegos.Modelos
{
    public class ResultadoJuego
    {
        public int IdResultadoJuego { get; set; } // Identity, no nullable
        public int IdJuego { get; set; } // No nullable
        public int CantidadItems { get; set; } // No nullable
        public int CantidadAciertos { get; set; } // No nullable
        public decimal Nota { get; set; } // No nullable
        public DateTime FechaRegistro { get; set; } // No nullable
    }
}
