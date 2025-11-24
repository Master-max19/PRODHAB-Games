
import { actualizarJuego } from "../services/juegosService.js";
import { eliminarPalabra, cargarPalabras, crearPalabras } from "../services/juegoPalabrasService.js";
import { validarSubItems, mostrarMensajeModal } from "../util/juegoFunctionUtility.js";
import { getJuegoSeleccionado } from "../controllers/AdminJuegosController.js";
export function inicializarOrdenarPalabras() {
document.addEventListener("admin-ordenar-palabras", (e) => {
    const gestor = e.target;

    gestor.addEventListener("item-saved", async (e) => {
        const { titulo, isNew } = e.detail;

        if (isNew) return;
        try {
            await actualizarJuego(
                Number(getJuegoSeleccionado()),
                { Descripcion: titulo }
            );

            mostrarMensajeModal("Éxito", `✓ Ronda "${titulo}" actualizada correctamente`);
        } catch (err) {
            console.error(err);
            mostrarMensajeModal("Error", `✗ Error al actualizar: ${err.message || err}`);
        }
    });

    gestor.addEventListener("subitems-save-requested", async (e) => {
        const { itemId, subItems } = e.detail;

        const valido = validarSubItems(gestor, itemId, subItems, 50);
        if (!valido) return;

        try {
            const palabras = subItems.map((s) => s.texto);
            if (!palabras.length) return;

            const resp = await crearPalabras(
                Number(getJuegoSeleccionado()),
                palabras
            );

            const item = gestor._items.find((i) => String(i.id) === String(itemId));
            if (!item) {
                mostrarMensajeModal("Error", `Juego no encontrado`);
                return;
            }

            if (resp && Array.isArray(resp.palabras) && resp.palabras.length > 0) {
                resp.palabras.forEach((p) => {
                    const textoPalabra = p.palabra;
                    const idReal = String(p.idPalabraJuego);

                    const nuevoSubitem = {
                        id: idReal,
                        texto: textoPalabra,
                    };

                    item.subItems.push(nuevoSubitem);
                });
            }

            const state = gestor._itemStates.get(itemId);
            if (state) {
                state.pendingSubItems = [];
            }

            gestor._render();
            mostrarMensajeModal("Éxito", `✓ ${palabras.length} palabras guardadas correctamente`);

        } catch (err) {
            mostrarMensajeModal("Error", `✗ Error: ${err.message || err}`);
        }
    });

    gestor.shadowRoot.addEventListener("click", async (e) => {
        if (!e.target.matches(".sublist .chip button")) return;

        const chipEl = e.target.closest(".chip");
        const palabraId = chipEl.dataset.id;
        if (!palabraId) return;

        let item = gestor._items.find(i => i.subItems.some(s => s.id === palabraId));
        let state = gestor._itemStates.get(item?.id) || { pendingSubItems: [] };

        if (state.pendingSubItems.some(s => s.id === palabraId)) {
            state.pendingSubItems = state.pendingSubItems.filter(s => s.id !== palabraId);
            gestor._render();
            return;
        }

        if (!isNaN(Number(palabraId))) {
            mostrarMensajeModal(
                "Confirmar eliminación",
                "¿Deseas eliminar esta palabra?",
                async () => {
                    try {
                        await eliminarPalabra(palabraId);

                        item.subItems = item.subItems.filter(s => s.id !== palabraId);
                        gestor._render();

                    } catch (err) {
                        console.error(err);
                        mostrarMensajeModal(
                            "Error",
                            `✗ Error al eliminar palabra: ${err.message}`
                        );
                    }
                }
            );
        }
    });

    // Cargar datos iniciales
    (async function cargarDatos() {
        try {
            const items = await cargarPalabras(
                Number(getJuegoSeleccionado())
            );

            gestor.loadItems(items);
            gestor.setAttribute("title", items[0]?.nombre || "Gestor de Palabras del Juego");

        } catch (err) {
            console.error("Error al cargar datos:", err);
        }
    })();

});
}