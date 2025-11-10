const completarTextoService = (() => {



    function normalizarTextoCompletar(texto) {
        return texto.trim().toLowerCase();
    }

    function transformarFraseOrdenSecuencial(texto, palabras) {
        const distractores = [...palabras.map(p => p.trim()).filter(p => p.length > 0)];
        let matches = [];
        let contador = 1;
        let formato = texto;

        palabras.forEach(palabra => {
            if (!palabra.trim()) return;
            const palabraEscape = palabra.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${palabraEscape}\\b`, "gi");

            formato = formato.replace(regex, (match) => {
                matches.push(match);
                const idx = distractores.findIndex(p => normalizarTextoCompletar(p) === normalizarTextoCompletar(match));
                if (idx !== -1) distractores.splice(idx, 1);
                return `___${contador++}___`;
            });
        });

        return { formato, matches, distractores };
    }


    return {
        async obtenerDatosCompletarTexto(idJuego) {
            const response = await fetch(`${CONFIG.apiUrl}/api/completar-texto/${idJuego}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            if (!data.exito) throw new Error(data.mensaje);
            return data;
        },
        async obtenerRondas(idJuego = 3) {
            const data = await this.obtenerDatosCompletarTexto(idJuego);
            if (!Array.isArray(data.rondas)) return [];

            if (!idJuego) {
                const params = new URLSearchParams(window.location.search);
                idJuego = params.get('idCompletar');
            }


            const rondasFormateadas = data.rondas
                .map(ronda => {
                    if (!Array.isArray(ronda.palabras) || ronda.palabras.length === 0) return null;

                    const palabrasLimpias = ronda.palabras.map(p => p.trim()).filter(p => p.length > 0);
                    if (palabrasLimpias.length === 0) return null;

                    const { formato, matches, distractores } = transformarFraseOrdenSecuencial(ronda.texto, palabrasLimpias);
                    if (matches.length === 0) return null;

                    return { texto: formato, espacios: matches, distractores };
                })
                .filter(r => r !== null);

            return { idJuego, rondas: rondasFormateadas, descripcion: data.descripcion, detalle: data.detalle };
        },

        async obtenerRondasMapeadas(idJuego = 3) {
            const data = await this.obtenerDatosCompletarTextoAdmin(idJuego);
            if (!Array.isArray(data.rondas)) return { tema: data.descripcion, rondas: [] };

            const rondas = data.rondas.map(ronda => ({
                id: `${ronda.idPregunta}`,
                titulo: ronda.texto,
                subItems: (ronda.palabras || []).map(palabra => ({
                    id: `${palabra.idRespuesta}`,
                    texto: palabra.texto,
                }))
            }));

            return { tema: data.descripcion, rondas };
        }
        ,
        async obtenerDatosCompletarTextoAdmin(idJuego = 3) {
            try {
                const data = await apiFetch(`${CONFIG.apiUrl}/api/completar-texto/admin/${idJuego}`, {
                    method: "GET",
                });

                if (!data) throw new Error("No se recibió respuesta del servidor");
                if (!data.exito) throw new Error(data.mensaje);

                return data;
            } catch (err) {
                console.error("Error en obtenerDatosCompletarTextoAdmin:", err);
                throw err;
            }
        },

        async eliminarRonda(idRonda) {
            if (!idRonda) throw new Error("Debes proporcionar el ID de la ronda");

            try {
                const data = await apiFetch(`${CONFIG.apiUrl}/api/completar-texto/ronda/${idRonda}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                });

                // apiFetch ya retorna null si hay 401
                if (!data) return null;

                if (!data.exito) throw new Error(data.mensaje);

                return data;
            } catch (err) {
                console.error("Error en eliminarRonda:", err);
                throw err;
            }
        }
        ,
        async crearRonda(idJuego, enunciado) {
            if (!idJuego) throw new Error("Debes proporcionar el ID del juego");
            if (!enunciado) throw new Error("Debes proporcionar el enunciado de la ronda");

            try {
                const data = await apiFetch(`${CONFIG.apiUrl}/api/completar-texto/crear-ronda/${idJuego}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "*/*",
                    },
                    body: JSON.stringify({ enunciado }),
                });

                if (!data) return null; // sesión expirada manejada por apiFetch
                if (!data.exito) throw new Error(data.mensaje);

                return data;
            } catch (err) {
                console.error("Error en crearRonda:", err);
                throw err;
            }
        }
        ,



        async guardarSubitems(idItem, respuestas) {
            if (!idItem) throw new Error("Debes proporcionar el ID del item");
            if (!Array.isArray(respuestas)) throw new Error("Respuestas inválidas");

            try {
                const data = await apiFetch(`${CONFIG.apiUrl}/api/completar-texto/opciones/${idItem}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ respuestas }),
                });

                if (!data) return null; // sesión expirada manejada por apiFetch
                if (!data.exito) throw new Error(data.mensaje);

                return data;
            } catch (err) {
                console.error("Error en guardarSubitems:", err);
                throw err;
            }
        }
        ,
        async eliminarSubitem(idOpcion) {
            if (!idOpcion) throw new Error("Debes proporcionar el ID del subitem");

            try {
                const data = await apiFetch(`${CONFIG.apiUrl}/api/completar-texto/opcion-completar/${idOpcion}`, {
                    method: "DELETE",
                    headers: { "accept": "*/*" },
                });

                // apiFetch devuelve null si la sesión expiró
                if (!data) return null;

                // Si la API devuelve exito: false
                if (data.exito === false) throw new Error(data.mensaje || "Error al eliminar subitem");

                return data; // normalmente { exito: true } o mensaje
            } catch (err) {
                console.error("Error en eliminarSubitem:", err);
                throw err;
            }
        }
        , async actualizarRonda(id, enunciado) {
            try {
                const data = await apiFetch(`${CONFIG.apiUrl}/api/completar-texto/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enunciado }),
                });

                if (!data) return null; // sesión expirada

                return data;
            } catch (err) {
                console.error("Error en actualizarRonda:", err);
                throw err;
            }
        }

    };
})();


