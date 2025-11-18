/**
 * ==============================
 * Variables / objetos globales externos
 * ==============================
 */

/**
 * @namespace window.prodhab_juegos
 * @description Objeto global que contiene información del juego seleccionado
 */

/**
 * @property window.prodhab_juegos.juegoSeleccionado
 * @type {number}
 * @description ID del juego actualmente seleccionado
 */

/**
 * ==============================
 * Servicios / funciones externas
 * ==============================
 */

/**
 * @function juegoService.actualizarJuego
 * @async
 * @description Actualiza un juego en el backend
 */

/**
 * @function juegoPalabrasService.crearPalabras
 * @async
 * @description Crea nuevas palabras para un juego en el backend
 */

/**
 * @function juegoPalabrasService.eliminarPalabra
 * @async
 * @description Elimina una palabra de un juego en el backend
 */

/**
 * @function juegoPalabrasService.cargarPalabras
 * @async
 * @description Obtiene todas las palabras de un juego desde el backend
 */

/**
 * @function utilModalJuegos.mostrarMensajeModal
 * @description Muestra un modal de confirmación o mensaje al usuario
 */


(() => {


  document.addEventListener("admin-palabra-sopa-letras", (e) => {
    const gestor = e.target; // el componente que se acaba de conectar

    gestor.addEventListener("item-saved", async (e) => {
      const { titulo, isNew } = e.detail;
      if (isNew) return;
      try {
        await juegoService.actualizarJuego(Number(window.prodhab_juegos.juegoSeleccionado), { Descripcion: titulo });
        utilModalJuegos.mostrarMensajeModal(
          "Éxito",
          `✓ Ronda "${titulo}" actualizada correctamente`
        );
      } catch (err) {
        console.error(err);
        utilModalJuegos.mostrarMensajeModal(
          "Error",
          `✗ Error al actualizar: ${err.message || err}`
        );
      }
    });



    gestor.addEventListener("subitems-save-requested", async (e) => {
      const { itemId, subItems } = e.detail;

      const valido = utilValidacionesJuegos.validarSubItems(gestor, itemId, subItems, 14);
      if (!valido) return;
      try {
        const palabras = subItems.map((s) => s.texto);
        if (!palabras.length) return;

        const resp = await juegoPalabrasService.crearPalabras(
          Number(window.prodhab_juegos.juegoSeleccionado),
          palabras
        );

        const item = gestor._items.find(
          (i) => String(i.id) === String(itemId)
        );
        if (!item) {
          utilModalJuegos.mostrarMensajeModal("Error", `Juego no encontrado`);
          return;
        }
        if (
          resp &&
          Array.isArray(resp.palabras) &&
          resp.palabras.length > 0
        ) {
          resp.palabras.forEach((p) => {
            const textoPalabra = p.palabra;
            const idReal = String(p.idPalabraJuego);

            const nuevoSubitem = {
              id: idReal,
              texto: textoPalabra,
            };

            item.subItems.push(nuevoSubitem);
          });

          utilModalJuegos.mostrarMensajeModal(
            "Éxito",
            `✓ Se agregaron ${resp.palabras.length} palabras correctamente`
          );
        }
        const state = gestor._itemStates.get(itemId);
        if (state) {
          state.pendingSubItems = [];
        }

        gestor._render();
        utilModalJuegos.mostrarMensajeModal(
          "Éxito",
          `✓ Se agregaron ${resp.palabras.length} palabras correctamente`
        );
      } catch (err) {
        utilModalJuegos.mostrarMensajeModal(
          "Error",
          `✗ Error al actualizar: ${err.message || err}`
        );
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

        utilModalJuegos.mostrarMensajeModal(
          "Confirmar eliminación",
          "¿Deseas eliminar esta palabra?",
          async () => {
            try {
              await juegoPalabrasService.eliminarPalabra(palabraId);
              item.subItems = item.subItems.filter(s => s.id !== palabraId);
              gestor._render();

            } catch (err) {
              console.error(err);
              utilModalJuegos.mostrarMensajeModal(
                "Error",
                `✗ Error al eliminar palabra: ${err.message}`
              );
            }
          }
        );
      }

    });

    (async function cargarDatos() {
      try {
        const items = await juegoPalabrasService.cargarPalabras(Number(window.prodhab_juegos.juegoSeleccionado));
        gestor.loadItems(items);
        gestor.setAttribute("title", items[0]?.nombre || "Gestor de Palabras del Juego");
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    })();
  });



})();