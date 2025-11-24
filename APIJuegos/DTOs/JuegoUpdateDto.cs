namespace APIJuegos.DTOs
{
    /*
    *
    * Para crear el cuerpo del JSON cuando se actualzia los datos de un juego y evitar el envío del id.
    * Se utiliza en JuegoController.
    *
    */
    public class JuegoUpdateDto
    {
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool? Activo { get; set; }
    }
}
