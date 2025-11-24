namespace APIJuegos.DTOs
{
    /***
    Utilizado en JuegoController para mostrar únicamente las características del juego y evitar
    la lista de palabras relaciondas con el juego.
    */
    public class JuegoDto
    {
        public int IdJuego { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool Activo { get; set; } = true;
        public int IdTipoJuego { get; set; }
    }
}
