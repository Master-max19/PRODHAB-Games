/**
 * Servicio para obtener datos para el juego de Sopa de Letras.
 * @namespace juegoPalabrasService
 */
const juegoPalabrasService = {


    async cargarPalabras(idJuego) {
        if (!idJuego) return [];

        const response = await fetch(`${CONFIG.apiUrl}/api/PalabraJuego/porJuego/${idJuego}`);
        if (!response.ok) return [];

        const data = await response.json();
        if (!data || !Array.isArray(data.palabras)) return [];

        // Mapear al formato que espera loadItems
        return [
            {
                id: String(data.idJuego),              // id del juego
                titulo: data.descripcion || "",        // descripcion como titulo
                nombre: data.nombre || "",        // descripcion como titulo

                subItems: data.palabras.map((p) => ({
                    id: String(p.idPalabraJuego),     // id de la palabra
                    texto: p.palabra || ""            // texto de la palabra
                }))
            }
        ];
    }
    ,
    async eliminarPalabra(idPalabra) {
        if (!idPalabra) throw new Error("Debes proporcionar el ID de la palabra");

        const palabraId = parseInt(idPalabra, 10); // asegurarse que sea entero
        if (isNaN(palabraId)) throw new Error("ID de palabra inválido");

        const url = `${CONFIG.apiUrl}/api/PalabraJuego/${palabraId}`;

        const response = await fetch(url, {
            method: "DELETE",
            headers: { "accept": "*/*" },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Error al eliminar la palabra (status ${response.status})`);
        }

        try {
            const data = await response.json();
            return data;
        } catch {
            return { exito: true };
        }
    },


    async crearPalabras(idJuego, palabras) {
        if (!idJuego) throw new Error("Debes proporcionar el ID del juego");
        if (!Array.isArray(palabras) || palabras.length === 0)
            throw new Error("Debes enviar al menos una palabra");

        const url = `${CONFIG.apiUrl}/api/PalabraJuego/${idJuego}/multiples`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "*/*",
            },
            body: JSON.stringify({ palabras })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Error al crear palabras");
        }

        return res.json();
    }
};
