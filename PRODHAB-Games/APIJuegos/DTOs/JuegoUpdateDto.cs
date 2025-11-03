namespace APIJuegos.DTOs
{
    public class JuegoUpdateDto
    {
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool? Activo { get; set; }
    }
}
