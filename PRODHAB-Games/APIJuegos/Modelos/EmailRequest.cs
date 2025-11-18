using System;
using System.Collections.Generic;

namespace APIJuegos.Modelos
{
    public class EmailRequest
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = "Sin asunto";
        public string Body { get; set; } = "Sin contenido";
    }
}
