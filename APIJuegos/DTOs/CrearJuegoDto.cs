namespace APIJuegos.DTOs
{
    /**
     * Utilizado en "JuegoController" para crear un nuevo juego
     * y evitar enviar o mostrar el "idJuego".
     */
    public class CrearJuegoDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool Activo { get; set; } = true;
        public int IdTipoJuego { get; set; }
    }
}
