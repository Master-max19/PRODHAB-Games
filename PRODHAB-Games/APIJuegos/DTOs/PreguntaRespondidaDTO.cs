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
    public class OpcionDTO
    {
        // Identificador único de la opción
        public long IdOpcion { get; set; }
        // Indica si el usuario seleccionó esta opción
        public bool Seleccionada { get; set; }
    }
    /*
     * Representa una pregunta respondida por el usuario,
     * incluyendo las opciones seleccionadas.
     */
    public class PreguntaRespondidaDTO
    {
        // Identificador único de la pregunta
        public long IdPregunta { get; set; }

        // Lista de opciones disponibles para la pregunta y su estado de selección
        public List<OpcionDTO> Opciones { get; set; } = new List<OpcionDTO>();
    }
}
