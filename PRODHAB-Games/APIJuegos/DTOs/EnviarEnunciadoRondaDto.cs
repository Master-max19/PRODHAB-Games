namespace APIJuegos.DTOs
{
    /*Utilizado en CompletarTextoController para recibir y actualizar el Enunciado de una ronda*/
    public class EnviarEnunciadoRondaDto
    {
        public string Enunciado { get; set; } = string.Empty;
    }
}
