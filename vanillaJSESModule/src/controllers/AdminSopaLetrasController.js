// archivo: adminPalabraSopaLetras.js
// ES Module

import { actualizarJuego } from '../services/juegosService.js';
import { crearPalabras,eliminarPalabra, cargarPalabras} from '../services/juegoPalabrasService.js';
import { validarSubItems, mostrarMensajeModal } from '../util/juegoFunctionUtility.js';
import { getJuegoSeleccionado } from "../controllers/AdminJuegosController.js";

export function inicializarSopaLetras() {
  document.addEventListener("admin-palabra-sopa-letras", (e) => {
    const gestor = e.target; // el componente que se acaba de conectar

    // Actualizar título de la ronda
    gestor.addEventListener("item-saved", async (ev) => {
      const { titulo, isNew } = ev.detail;
      if (isNew) return;

      try {
        await actualizarJuego(Number(getJuegoSeleccionado()), { Descripcion: titulo });
        mostrarMensajeModal("Éxito", `✓ Ronda "${titulo}" actualizada correctamente`);
      } catch (err) {
        console.error(err);
        mostrarMensajeModal("Error", `✗ Error al actualizar: ${err.message || err}`);
      }
    });

    // Guardar subitems (palabras)
    gestor.addEventListener("subitems-save-requested", async (ev) => {
      const { itemId, subItems } = ev.detail;
      const valido = validarSubItems(gestor, itemId, subItems, 14);
      if (!valido) return;

      try {
        const palabras = subItems.map((s) => s.texto);
        if (!palabras.length) return;

        const resp = await crearPalabras(
          Number(getJuegoSeleccionado()),
          palabras
        );

        const item = gestor._items.find(i => String(i.id) === String(itemId));
        if (!item) {
          mostrarMensajeModal("Error", `Juego no encontrado`);
          return;
        }

        if (resp && Array.isArray(resp.palabras) && resp.palabras.length > 0) {
          resp.palabras.forEach((p) => {
            item.subItems.push({ id: String(p.idPalabraJuego), texto: p.palabra });
          });
        }

        const state = gestor._itemStates.get(itemId);
        if (state) state.pendingSubItems = [];

        gestor._render();
        mostrarMensajeModal("Éxito", `✓ Se agregaron ${resp.palabras.length} palabras correctamente`);
      } catch (err) {
        mostrarMensajeModal("Error", `✗ Error al actualizar: ${err.message || err}`);
      }
    });

    // Eliminar subitem al hacer click
    gestor.shadowRoot.addEventListener("click", async (ev) => {
      if (!ev.target.matches(".sublist .chip button")) return;

      const chipEl = ev.target.closest(".chip");
      const palabraId = chipEl.dataset.id;
      if (!palabraId) return;

      const item = gestor._items.find(i => i.subItems.some(s => s.id === palabraId));
      const state = gestor._itemStates.get(item?.id) || { pendingSubItems: [] };

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
              mostrarMensajeModal("Error", `✗ Error al eliminar palabra: ${err.message}`);
            }
          }
        );
      }
    });

    // Cargar datos iniciales
    (async () => {
      try {
        const items = await cargarPalabras(Number(getJuegoSeleccionado()));
        gestor.loadItems(items);
        gestor.setAttribute("title", items[0]?.nombre || "Gestor de Palabras del Juego");
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    })();
  });
}
