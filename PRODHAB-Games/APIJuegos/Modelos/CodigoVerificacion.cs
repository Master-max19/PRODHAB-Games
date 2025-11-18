using System;

namespace APIJuegos.Modelos
{
    public class CodigoVerificacion
    {
        public int IdCodigoVerificacion { get; set; }
        public int IdUsuario { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public DateTime Expiracion { get; set; }
        public bool Activo { get; set; }
    }
}
