/**
El propósito del archivo PreguntaRespondida.cs es definir modelos de datos que representan
cómo un usuario responde a las preguntas de un juego o test, de forma que la API pueda recibir
y procesar esa información de manera estructurada y segura.
*/

using System.Collections.Generic;

namespace APIJuegos.DTOs
{
    /*
     * Representa una opción de respuesta dentro de una pregunta en un test o juego.
     */
    public class OpcionDto
    {
        // Identificador único de la opción
        public long IdOpcion { get; set; }

        // Indica si el usuario seleccionó esta opción
        public bool Seleccionada { get; set; }
    }
}
