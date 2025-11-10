/**
 * Servicio para obtener datos para el juego de Sopa de Letras.
 * @namespace juegoPalabrasService
 */
const juegoPalabrasService = {


    async cargarPalabras(idJuego) {
        if (!idJuego) return [];

        try {
            const data = await apiFetch(`${CONFIG.apiUrl}/api/PalabraJuego/porJuego/${idJuego}`, {
                method: 'GET',
                headers: { 'Accept': '*/*' },
            });

            if (!data || !Array.isArray(data.palabras)) return [];

            return [
                {
                    id: String(data.idJuego),
                    titulo: data.descripcion || "",
                    nombre: data.nombre || "",
                    subItems: data.palabras.map(p => ({
                        id: String(p.idPalabraJuego),
                        texto: p.palabra || ""
                    }))
                }
            ];
        } catch (err) {
            console.error('Error al cargar palabras:', err);
            return [];
        }
    }
    , async eliminarPalabra(idPalabra) {
        if (!idPalabra) throw new Error("Debes proporcionar el ID de la palabra");

        const palabraId = parseInt(idPalabra, 10);
        if (isNaN(palabraId)) throw new Error("ID de palabra inválido");

        try {
            const data = await apiFetch(`${CONFIG.apiUrl}/api/PalabraJuego/${palabraId}`, {
                method: "DELETE",
                headers: { "accept": "*/*" },
            });

            // Si apiFetch devuelve null (por 401) o no hay data, asumimos éxito
            return data ?? { exito: true };
        } catch (err) {
            console.error("Error al eliminar palabra:", err);
            throw err;
        }
    }
    ,
    async crearPalabras(idJuego, palabras) {
        if (!idJuego) throw new Error("Debes proporcionar el ID del juego");
        if (!Array.isArray(palabras) || palabras.length === 0)
            throw new Error("Debes enviar al menos una palabra");

        const url = `${CONFIG.apiUrl}/api/PalabraJuego/${idJuego}/multiples`;

        try {
            const data = await apiFetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
                body: JSON.stringify({ palabras }),
            });

            // Si apiFetch devuelve null (por 401), podemos devolver objeto vacío o manejarlo
            return data ?? { exito: true };
        } catch (err) {
            console.error("Error al crear palabras:", err);
            throw err;
        }
    }

};
