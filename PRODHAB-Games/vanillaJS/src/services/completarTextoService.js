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

            // Escapamos caracteres especiales
            const palabraEscape = palabra.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            // Regex con \b para que coincida solo palabras completas
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

                    // Solo devolvemos la ronda si hay al menos un espacio reemplazado
                    if (matches.length === 0) return null;

                    return { texto: formato, espacios: matches, distractores };
                })
                .filter(r => r !== null); // eliminamos las rondas vacías

            return {idJuego, rondas: rondasFormateadas, descripcion: data.descripcion, detalle: data.detalle };
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
            const response = await fetch(`${CONFIG.apiUrl}/api/completar-texto/admin/${idJuego}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            if (!data.exito) throw new Error(data.mensaje);
            return data;
        },

        async eliminarRonda(idRonda) {
            if (!idRonda) throw new Error("Debes proporcionar el ID de la ronda");

            const response = await fetch(`${CONFIG.apiUrl}/api/completar-texto/ronda/${idRonda}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al eliminar la ronda: ${response.status} - ${errorText}`);
            }

            // Intentamos parsear JSON solo si hay contenido
            let data = {};
            const text = await response.text();
            if (text) {
                try {
                    data = JSON.parse(text);
                    if (!data.exito) throw new Error(data.mensaje);
                } catch {
                    // No era JSON, pero la eliminación fue exitosa
                    data = { success: true };
                }
            } else {
                data = { success: true };
            }

            return data;
        },

        async crearRonda(idJuego, enunciado) {
            const res = await fetch(`${CONFIG.apiUrl}/api/completar-texto/crear-ronda/${idJuego}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
                body: JSON.stringify({ enunciado }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Error al crear ronda");
            }

            return res.json();
        },




        async guardarSubitems(idItem, respuestas) {
            try {
                const res = await fetch(`${CONFIG.apiUrl}/api/completar-texto/opciones/${idItem}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ respuestas }),
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || "Error al guardar subitems");
                }

                const data = await res.json();
                return data; // retorna la respuesta del backend
            } catch (err) {
                console.error("SubitemsService.guardarSubitems:", err);
                throw err;
            }
        },


        async eliminarSubitem(idOpcion) {
            if (!idOpcion) throw new Error("Debes proporcionar el ID del subitem");

            const url = `${CONFIG.apiUrl}/api/completar-texto/opcion-completar${idOpcion}`;

            const response = await fetch(url, {
                method: "DELETE",
                headers: { "accept": "*/*" },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || `Error al eliminar subitem (status ${response.status})`);
            }

            try {
                const data = await response.json();
                return data; // Puede ser { exito: true } o algún mensaje
            } catch {
                return { exito: true }; // Si no retorna JSON, asumimos éxito
            }
        },
        async actualizarRonda(id, enunciado) {
            const resp = await fetch(`${CONFIG.apiUrl}/api/completar-texto/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enunciado }),
            });
            if (!resp.ok) throw new Error(`Error ${resp.status}`);
            return await resp.json();
        }
    };
})();


