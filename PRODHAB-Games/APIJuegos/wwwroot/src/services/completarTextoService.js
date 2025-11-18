const completarTextoService = (() => {
    function normalizarTextoCompletar(texto) {
        return texto
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function transformarFraseOrdenSecuencial(texto, palabras) {
        const palabrasLimpias = palabras
            .map(p => p.trim())
            .filter(p => p.length > 0);

        // 1. Encontrar TODAS las coincidencias en el texto (en orden real)
        const coincidencias = [];
        const textoMinus = normalizarTextoCompletar(texto);

        // Recorrer cada palabra y buscar TODAS sus apariciones
        palabrasLimpias.forEach(palabraOriginal => {
            const norma = normalizarTextoCompletar(palabraOriginal);
            const escape = palabraOriginal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${escape}\\b`, "gi");

            let match;
            while ((match = regex.exec(texto)) !== null) {
                const inicio = match.index;
                const fin = regex.lastIndex;
                const textoEncontrado = match[0];

                coincidencias.push({
                    palabra: textoEncontrado,
                    inicio,
                    fin,
                    normalizado: norma
                });
            }
        });

        // 2. Ordenar por posición en el texto (¡esto es clave!)
        coincidencias.sort((a, b) => a.inicio - b.inicio);
        // 3. Eliminar duplicados que se solapen o repitan en la misma posición
        const unicos = [];
        const posicionesUsadas = new Set();

        for (const c of coincidencias) {
            let solapado = false;
            for (const pos of posicionesUsadas) {
                if (c.inicio < pos.fin && c.fin > pos.inicio) {
                    solapado = true;
                    break;
                }
            }
            if (!solapado) {
                unicos.push(c);
                posicionesUsadas.add(c);
            }
        }

        // 4. Reemplazar en orden correcto
        let formato = texto;
        const matches = [];
        let offset = 0;
        let contador = 1;

        unicos.forEach(coincidencia => {
            const inicio = coincidencia.inicio + offset;
            const fin = coincidencia.fin + offset;
            const reemplazo = `___${contador++}___`;

            formato = formato.slice(0, inicio) + reemplazo + formato.slice(fin);
            matches.push(coincidencia.palabra);

            offset += reemplazo.length - (fin - inicio);
        });

        // 5. Distractores = palabras que NO aparecieron en el texto
        const usadas = new Set(matches.map(m => normalizarTextoCompletar(m)));
        const distractores = palabrasLimpias.filter(p =>
            !usadas.has(normalizarTextoCompletar(p))
        );

        return {
            formato,
            matches,
            distractores
        };
    }


    async function obtenerDatosCompletarTexto(idJuego) {
        if (!idJuego) {
            const params = new URLSearchParams(window.location.search);
            idJuego = params.get('idCompletar');
        }
        const response = await fetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/${idJuego}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        if (!data.exito) throw new Error(data.mensaje);
        return data;
    }


    async function obtenerRondas(idJuego = 3) {
        if (!idJuego) {
            const params = new URLSearchParams(window.location.search);
            idJuego = params.get('idCompletar');
        }

        const data = await this.obtenerDatosCompletarTexto(idJuego);

        if (!Array.isArray(data.rondas)) return [];
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
    }



    async function obtenerRondasMapeadas(idJuego = 3) {
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

    async function obtenerDatosCompletarTextoAdmin(idJuego = 3) {
        try {
            const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/admin/${idJuego}`, {
                method: "GET",
            });

            if (!data) throw new Error("No se recibió respuesta del servidor");
            if (!data.exito) throw new Error(data.mensaje);

            return data;
        } catch (err) {
            console.error("Error en obtenerDatosCompletarTextoAdmin:", err);
            throw err;
        }
    }

    async function eliminarRonda(idRonda) {
        if (!idRonda) throw new Error("Debes proporcionar el ID de la ronda");

        try {
            const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/ronda/${idRonda}`, {
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
    async function crearRonda(idJuego, enunciado) {
        if (!idJuego) throw new Error("Debes proporcionar el ID del juego");
        if (!enunciado) throw new Error("Debes proporcionar el enunciado de la ronda");

        try {
            const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/crear-ronda/${idJuego}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "*/*",
                },
                body: JSON.stringify({ enunciado }),
            });

            if (!data) return null; 
            if (!data.exito) throw new Error(data.mensaje);

            return data;
        } catch (err) {
            console.error("Error en crearRonda:", err);
            throw err;
        }
    }



    async function guardarSubitems(idItem, respuestas) {
        if (!idItem) throw new Error("Debes proporcionar el ID del item");
        if (!Array.isArray(respuestas)) throw new Error("Respuestas inválidas");

        try {
            const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/opciones/${idItem}`, {
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


    async function eliminarSubitem(idOpcion) {
        if (!idOpcion) throw new Error("Debes proporcionar el ID del subitem");

        try {
            const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/opcion-completar/${idOpcion}`, {
                method: "DELETE",
                headers: { "accept": "*/*" },
            });

            if (!data) return null;

            // Si la API devuelve exito: false
            if (data.exito === false) throw new Error(data.mensaje || "Error al eliminar subitem");

            return data; // normalmente { exito: true } o mensaje
        } catch (err) {
            console.error("Error en eliminarSubitem:", err);
            throw err;
        }
    }
    async function actualizarRonda(id, enunciado) {
        try {
            const data = await utilFetch.apiFetch(`${CONFIG_JUEGO_PRODHAB.apiUrl}/api/completar-texto/${id}`, {
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
    return {
        obtenerDatosCompletarTexto, obtenerRondas,
        obtenerRondasMapeadas, obtenerDatosCompletarTextoAdmin,
        eliminarRonda, crearRonda, guardarSubitems,
        eliminarSubitem, actualizarRonda
    };

})();


