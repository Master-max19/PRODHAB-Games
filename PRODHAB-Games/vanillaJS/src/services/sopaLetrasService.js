

const sopaLetrasService = {
    /**
         * Obtiene datos reales de la sopa de letras desde la API o desde la URL (?id=)
         * @param {number} [idSopa] - ID opcional; si no se pasa, se obtiene de la URL.
         * @returns {Promise<{idJuego:number, tema:string, detalle:string, palabras:string[]}>}
         */
    async obtenerDatosSopa(idSopa) {
        try {
            // Si no se pasó el ID, obtenerlo desde la URL (?id=)
            if (!idSopa) {
                const params = new URLSearchParams(window.location.search);
                idSopa = parseInt(params.get("idSopa")); // 4 por defecto
            }

            const res = await fetch(`${CONFIG.apiUrl}/api/PalabraJuego/solo-palabras/${idSopa}`);
            if (!res.ok) throw new Error("Error al obtener datos de la API");

            const data = await res.json();

            // Normalizar datos
            return {
                idJuego: data.idJuego,
                descripcion: data.descripcion,
                detalle: data.detalle || "",
                nombre: data.nombre || "Sopa de letras",
                palabras: Array.isArray(data.palabras)
                    ? data.palabras.map(p => p.toUpperCase())
                    : []
            };
        } catch (err) {
            console.error("SopaLetrasService:", err);
            return {
                idJuego: null,
                tema: "Países",
                detalle: "Encuentra los nombres de países en la sopa de letras.",
                palabras: ["JAPÓN", "BRASIL", "FRANCIA", "CANADÁ"]
            };
        }
    },

}