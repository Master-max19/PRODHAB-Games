
using APIJuegos.Modelos;

namespace APIJuegos.DTOs
{
    public class RecibirItemSopaDto
    {
        // Palabra o frase a buscar
        public string Enunciado { get; set; }

        // Indica si el �tem est� activo
        public bool Activa { get; set; } = true;
    }
}