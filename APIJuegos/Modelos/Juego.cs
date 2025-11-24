using System;
using System.Collections.Generic;

namespace APIJuegos.Modelos
{
    public class Juego
    {
        public int IdJuego { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string? Detalle { get; set; }
        public bool Activo { get; set; } = false;
        public int IdTipoJuego { get; set; }
        public ICollection<PalabraJuego> PalabrasJuego { get; set; } = new List<PalabraJuego>();
    }
}
