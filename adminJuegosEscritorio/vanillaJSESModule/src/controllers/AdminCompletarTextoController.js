import { guardarSubitems, eliminarRonda, crearRonda, obtenerRondasMapeadas, actualizarRonda, eliminarSubitem } from "../services/completarTextoService.js";
import { validarSubItems, mostrarMensajeModal, validarYRevertirTitulo } from "../util/juegoFunctionUtility.js";
import { getJuegoSeleccionado } from "../controllers/AdminJuegosController.js";

export function inicializarCompletarTexto() {

    document.addEventListener("admin-completar-texto", (e) => {

        const gestor = document.querySelector("#admin-completar-texto");

        // --- SUBITEMS GUARDADOS ---
        gestor.addEventListener("subitems-save-requested", async (e) => {
            const { itemId, subItems } = e.detail;

            const valido = validarSubItems(
                gestor,
                itemId,
                subItems,
                50
            );
            if (!valido) return;

            try {
                const respuestas = subItems.map((s) => s.texto);

                const resp = await guardarSubitems(
                    itemId,
                    respuestas
                );

                const item = gestor._items.find(i => String(i.id) === String(itemId));

                if (item) {
                    if (resp?.ids?.length > 0) {
                        const nuevos = resp.ids.map((id, idx) => ({
                            id,
                            texto: respuestas[idx],
                        }));
                        item.subItems.push(...nuevos);
                    } else {
                        mostrarMensajeModal("Error", "Respuesta sin IDs válidos");
                    }
                }

                const state = gestor._itemStates.get(itemId);
                if (state) state.pendingSubItems = [];

                gestor._render();

                mostrarMensajeModal(
                    "Aviso",
                    `✓ ${respuestas.length} subitems guardados`
                );

            } catch (err) {
                mostrarMensajeModal(
                    "Error",
                    `✗ Error: ${err.message || err}`
                );
            }
        });

        // --- ELIMINAR ÍTEM ---
        gestor.addEventListener("item-delete-requested", (ev) => {
            const { itemId, absIdx } = ev.detail;

            mostrarMensajeModal(
                "Confirmar eliminación",
                "¿Seguro que quieres eliminar este ítem?",
                async () => {
                    try {
                        await eliminarRonda(Number(itemId));
                        gestor.removeItem(absIdx);
                        mostrarMensajeModal("Aviso", "✓ Ítem eliminado correctamente");
                    } catch (err) {
                        mostrarMensajeModal("Error", `✗ ${err.message}`);
                    }
                }
            );
        });

        // --- CREAR ÍTEM ---
        gestor.addEventListener("item-saved", async (e) => {
            const { titulo, isNew, id } = e.detail;
            if (!isNew) return;

            const ok = validarYRevertirTitulo(
                gestor, titulo, id, 600
            );
            if (!ok) return;

            try {
                const resp = await crearRonda(
                    Number(getJuegoSeleccionado()),
                    titulo
                );

                const newId = resp.pregunta.idPregunta;
                const items = gestor.getItems();
                const item = items.find(i => i.id === id);
                if (item) item.id = newId;

                gestor.loadItems(items);

            } catch (err) {
                mostrarMensajeModal("Error", `✗ ${err.message}`);
            }
        });

        // --- ACTUALIZAR ÍTEM ---
        gestor.addEventListener("item-saved", async (e) => {
            const { titulo, isNew, id } = e.detail;
            if (isNew) return;

            const ok = validarYRevertirTitulo(
                gestor, titulo, id, 600
            );
            if (!ok) return;

            try {
                await actualizarRonda(id, titulo);
            } catch (err) {
                mostrarMensajeModal("Error", `✗ ${err.message}`);
            }
        });

        // --- ELIMINAR SUBITEM ---
        gestor.shadowRoot.addEventListener("click", (e) => {
            if (!e.target.matches(".sublist .chip button")) return;

            const chipEl = e.target.closest(".chip");
            const subId = chipEl.dataset.id;

            const item = gestor._items.find(i =>
                i.subItems.some(s => String(s.id) === String(subId))
            );
            if (!item) return;

            mostrarMensajeModal(
                "Confirmar eliminación",
                "¿Deseas eliminar este subitem?",
                async () => {
                    try {
                        await eliminarSubitem(subId);
                        item.subItems = item.subItems.filter(s => String(s.id) !== String(subId));
                        gestor._render();
                    } catch (err) {
                        mostrarMensajeModal("Error", err.message);
                    }
                }
            );
        });

        // --- CARGAR DATOS INICIALES ---
        async function cargarDatos() {
            try {
                const datos = await obtenerRondasMapeadas(
                    Number(getJuegoSeleccionado())
                );

                gestor.loadItems(datos.rondas);
                gestor.setAttribute("title", datos.tema);

            } catch (err) {
                console.error("Error al cargar:", err);
            }
        }

        cargarDatos();
    });
}
