/**
 * Servicio para obtener textos y palabras para el juego de memoria.
 * @namespace OrdenaLetrasService
 */
const OrdenaLetrasService = {
  /**
   * Obtiene un objeto con un texto, palabras clave y tema.
   * Devuelve uno de los ejemplos de forma aleatoria.
   *
   * @async
   * @function obtenerTextoYPalabras
   * @param {number} [idJuego=2] - Identificador del juego (opcional).
   * @returns {Promise<Object>} Objeto con información del juego.
   * @returns {number} return.idJuego - ID del juego.
   * @returns {string} return.texto - Texto de introducción.
   * @returns {string[]} return.palabras - Palabras clave a adivinar.
   * @returns {string} return.tema - Tema del texto.
   *
   * @example
   * const res = await OrdenaLetrasService.obtenerTextoYPalabras(2);
   * console.log(res.texto); // "El café de Costa Rica es reconocido..."
   * console.log(res.palabras); // ["café", "Costa", "Rica"]
   * console.log(res.tema); // "Gastronomía"
   */
  async obtenerTextoYPalabras(idJuego = 2) {
    try {
      const res = await fetch(`https://localhost:7006/api/Preguntas/juegos/${idJuego}`);
      if (!res.ok) throw new Error('Error al obtener texto');
      
      const data = await res.json();
      
      const preguntaAleatoria = data.preguntas[Math.floor(Math.random() * data.preguntas.length)];
      
      return {
        idJuego,
        texto: preguntaAleatoria.enunciado.trim(),
        palabras: preguntaAleatoria.respuestas.map(r => r.texto),
        tema: data.nombre 
      };
      
    } catch (error) {
      console.error('Error fetching texto:', error);
      return {
        idJuego,
        texto: "En Costa Rica, la Ley 8968 protege la información personal.",
        palabras: ["Costa", "Rica", "8968"],
        tema: "Protección de datos"
      };
    }
  }
};

// Uso
OrdenaLetrasService.obtenerTextoYPalabras().then(res => console.log(res));
