/**
 * ==============================
 * Variables / objetos globales externos
 * ==============================
 */

/**
 * @global window.prodhab_juegos
 * @property {number} juegoSeleccionado - ID del juego actualmente seleccionado
 */

/**
 * @element #admin-completar-texto
 * @description Componente de gestión de rondas y subitems para completar texto
 */

/**
 * ==============================
 * Servicios / funciones externas
 * ==============================
 */

/**
 * @function completarTextoService.guardarSubitems
 * @async
 * @description Guarda un array de subitems en el backend
 */

/**
 * @function completarTextoService.eliminarRonda
 * @async
 * @description Elimina una ronda completa del backend
 */

/**
 * @function completarTextoService.crearRonda
 * @async
 * @description Crea una nueva ronda en el backend
 */

/**
 * @function completarTextoService.actualizarRonda
 * @async
 * @description Actualiza el título de una ronda existente
 */

/**
 * @function completarTextoService.eliminarSubitem
 * @async
 * @description Elimina un subitem específico de una ronda
 */

/**
 * @function completarTextoService.obtenerRondasMapeadas
 * @async
 * @description Obtiene todas las rondas y sus subitems del juego
 */

/**
 * @function utilModalJuegos.mostrarMensajeModal
 * @description Muestra un modal con mensaje o confirmación al usuario
 */

(() => {


    document.addEventListener("admin-completar-texto", (e) => {
        const gestor = document.querySelector("#admin-completar-texto");
        gestor.addEventListener("subitems-save-requested", async (e) => {
            const { itemId, subItems } = e.detail;

            try {
                const respuestas = subItems.map((s) => s.texto);
                const resp = await completarTextoService.guardarSubitems(
                    itemId,
                    respuestas
                );


                const item = gestor._items.find(
                    (i) => String(i.id) === String(itemId)
                );

                if (item) {

                    if (
                        resp &&
                        resp.ids &&
                        Array.isArray(resp.ids) &&
                        resp.ids.length > 0
                    ) {
                        const nuevoSubitems = resp.ids.map((id, idx) => ({
                            id: id,
                            texto: respuestas[idx],
                        }));

                        item.subItems.push(...nuevoSubitems);
                    } else {

                        utilModalJuegos.mostrarMensajeModal(
                            "Error",
                            "8. Respuesta sin ids o ids vacío");
                    }
                } else {

                    utilModalJuegos.mostrarMensajeModal(
                        "Error",
                        "ERROR: Item no encontrado");
                }

                // 3. LIMPIAR PENDIENTES
                const state = gestor._itemStates.get(itemId);
                if (state) {
                    state.pendingSubItems = [];
                }

                gestor._render();

                utilModalJuegos.mostrarMensajeModal(
                    "Aviso",
                    `✓ ${respuestas.length} subitems guardados`
                );
            } catch (err) {
                console.error("ERROR:", err);

                utilModalJuegos.mostrarMensajeModal(
                    "Error",
                    `✗ Error: ${err.message || err}`
                );
            }
        });


        gestor.addEventListener("item-delete-requested", (ev) => {
            const { itemId, absIdx } = ev.detail;

            utilModalJuegos.mostrarMensajeModal(
                "Confirmar eliminación",
                "¿Seguro que quieres eliminar este ítem?",
                async () => {
                    try {
                        await completarTextoService.eliminarRonda(Number(itemId));
                        gestor.removeItem(absIdx);
                        utilModalJuegos.mostrarMensajeModal("Aviso", "✓ Ítem eliminado correctamente");
                    } catch (err) {
                        console.error(err);
                        utilModalJuegos.mostrarMensajeModal("Error", `✗ Error al eliminar: ${err.message}`);
                    }
                }
            );
        });


        gestor.addEventListener("item-saved", async (e) => {
            const { titulo, isNew, id } = e.detail;
            if (!isNew) return;

            try {
                const resp = await completarTextoService.crearRonda(Number(window.prodhab_juegos.juegoSeleccionado), titulo);
                const idPregunta = resp.pregunta.idPregunta;
                const items = gestor.getItems();
                const item = items.find((i) => i.id === id);
                if (item) item.id = idPregunta;
                gestor.loadItems(items);
            } catch (err) {
                utilModalJuegos.mostrarMensajeModal(
                    "Error",
                    `✗ Error: ${err.message || JSON.stringify(err)}`
                );
            }
        });

        gestor.addEventListener("item-saved", async (e) => {
            const { titulo, isNew, id } = e.detail;
            if (isNew) return;

            try {
                const resp = await completarTextoService.actualizarRonda(
                    id,
                    titulo
                );
            } catch (err) {
                utilModalJuegos.mostrarMensajeModal(
                    "Error",
                    `✗ Error al actualizar: ${err.message || err}`
                );
            }
        });



        gestor.shadowRoot.addEventListener("click", (e) => {
            if (!e.target.matches(".sublist .chip button")) return;

            const chipEl = e.target.closest(".chip");
            const subId = chipEl.dataset.id;
            if (!subId) return;
            const gestorActual = gestor;
            const item = gestorActual._items.find(i => i.subItems.some(s => String(s.id) === String(subId)));
            if (!item) return;

            utilModalJuegos.mostrarMensajeModal(
                "Confirmar eliminación",
                "¿Deseas eliminar este subitem?",
                async () => {
                    try {
                        const resp = await completarTextoService.eliminarSubitem(subId);
                        item.subItems = item.subItems.filter(s => String(s.id) !== String(subId));
                        gestorActual._render();

                    } catch (err) {
                        console.error(err);
                        utilModalJuegos.mostrarMensajeModal("Error", `Error al eliminar subitem: ${err.message}`);
                    }
                }
            );
        });


        async function cargarDatos() {
            try {
                const datos = await completarTextoService.obtenerRondasMapeadas(Number(window.prodhab_juegos.juegoSeleccionado));
                gestor.loadItems(datos.rondas);
                gestor.setAttribute("title", datos.tema);
            } catch (err) {
                console.error("Error al cargar:", err);
            }
        }
        cargarDatos();
    });


})();