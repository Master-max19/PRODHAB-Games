namespace APIJuegos.Modelos
{
    public class ResultadosJuego
    {
        public int IdResultadoJuego { get; set; }  // Identity, no nullable
        public int IdJuegos { get; set; }         // No nullable
        public int CantidadItems { get; set; }         // No nullable
        public int Aciertos { get; set; }        // No nullable
        public decimal Nota { get; set; }         // No nullable
        public DateTime FechaRegistro { get; set; } // No nullable
    }
}