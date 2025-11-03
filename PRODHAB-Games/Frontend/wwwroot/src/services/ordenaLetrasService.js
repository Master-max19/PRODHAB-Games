/**
 * Servicio para obtener palabras y descripción de un juego.
 * @namespace OrdenaLetrasService
 */
const OrdenaLetrasService = {
  /**
   * Obtiene palabras y texto de un juego a partir de su ID,
   * filtrando solo las palabras que aparecen en el texto.
   * @async
   * @function obtenerTextoYPalabras
   * @param {number} [idOrdenar=4] - ID del juego (opcional).
   * @returns {Promise<Object>} Objeto con {idJuego, texto, palabras, tema}.
   */
  async obtenerTextoYPalabras(idOrdenar) {
    try {

      if (!idOrdenar) {
        const params = new URLSearchParams(window.location.search);
        idOrdenar = params.get('idOrdenar');
      }
      const res = await fetch(`${CONFIG.apiUrl}/api/PalabraJuego/solo-palabras/${idOrdenar}`);
      if (!res.ok) throw new Error('Error al obtener palabras del juego');

      const data = await res.json();

      const texto = data.descripcion || '';
      const todasPalabras = data.palabras || [];

      // Filtrar solo las palabras que aparecen en el texto
      // Filtrar solo palabras completas que aparecen en el texto
      const palabrasFiltradas = todasPalabras.filter(p => {
        if (!p) return false;

        // Normalizamos a minúsculas
        const palabraNorm = p.toLowerCase();
        const textoNorm = texto.toLowerCase();

        // Creamos regex con límite de palabra (\b)
        // Esto asegura que "ANTI" no se detecte dentro de "ANTARERO"
        const regex = new RegExp(`\\b${palabraNorm}\\b`, "i");

        return regex.test(textoNorm);
      });


      return {
        idJuego: data.idJuego,
        texto, // la descripción
        palabras: palabrasFiltradas, // palabras que realmente aparecen en el texto
        tema: data.nombre || '', // nombre del juego como tema
        detalle: data.detalle
      };
    } catch (err) {
      console.error('Error fetching texto y palabras:', err);
      return { idJuego: idOrdenar, texto: '', palabras: [], tema: '' };
    }
  }
};

