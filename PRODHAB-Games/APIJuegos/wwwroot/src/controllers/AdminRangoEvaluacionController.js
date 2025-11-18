/**
 * ==============================
 * Variables / objetos globales externos
 * ==============================
 */

/**
 * @global #tabla-rango-evaluacion
 * @description Tabla de rangos de evaluación existente en el DOM
 */

/**
 * ==============================
 * Servicios / funciones externas
 * ==============================
 */

/**
 * @function RangoEvaluacionService.obtenerPorJuego
 * @async
 * @description Obtiene todos los rangos de evaluación de un juego específico
 */

/**
 * @function RangoEvaluacionService.crear
 * @async
 * @description Crea un nuevo rango de evaluación
 */

/**
 * @function RangoEvaluacionService.editar
 * @async
 * @description Edita un rango de evaluación existente
 */

/**
 * @function RangoEvaluacionService.eliminar
 * @async
 * @description Elimina un rango de evaluación existente
 */

/**
 * @function utilModalJuegos.mostrarMensajeModal
 * @description Muestra un modal con mensaje o confirmación al usuario
 */


(() => {


  const tablaExistente = document.getElementById("tabla-rango-evaluacion");

  document.addEventListener("tabla-rango-evaluacion", async (e) => {

    const idJuego = document.getElementById("tabla-rango-evaluacion").getAttribute('service-id');

    const tabla = e.detail.tabla;
    if (!tabla || tabla.__initialized) return;
    tabla.__initialized = true;



    tabla.hiddenColumns = ["id", "idJuego"];


    const cargarDatos = async () => {
      try {
        const data = await RangoEvaluacionService.obtenerPorJuego(idJuego);
        tabla.dataSource = data.map(u => ({
          id: u.idRangoEvaluacion,
          idJuego: u.idJuego,
          rangoMinimo: u.rangoMinimo,
          rangoMaximo: u.rangoMaximo,
          mensaje: u.mensaje,
        }));
      } catch (err) {
        console.error("Error cargando datos:", err);

        tabla.columnNames = {
          rangoMinimo: "Rango mínimo",
          rangoMaximo: "Rango máximo",
          mensaje: "Mensaje"
        };
      }
    };

    tabla.columnNames = { rangoMaximo: "Rango máximo", rangoMinimo: "Rango mínimo" };

    await cargarDatos();

    // Guardar fila
    tabla.addEventListener("row-save-request", async (event) => {
      event.preventDefault();
      const { row, isNew, id } = event.detail;



      const { valido, mensaje } = validarRangoEvaluacion(row.rangoMinimo, row.rangoMaximo);
      if (!valido) {
        utilModalJuegos.mostrarMensajeModal("Error", mensaje);
        return;
      }


      try {
        if (isNew) {
          const creado = await RangoEvaluacionService.crear({
            rangoMinimo: Number(row.rangoMinimo),
            rangoMaximo: Number(row.rangoMaximo),
            mensaje: row.mensaje,
          }, idJuego);
          const fila = tabla.data.find(r => r._id === id);
          Object.assign(fila, { ...row, id: creado.idRangoEvaluacion });
          delete fila._isNew;
        } else {
          await RangoEvaluacionService.editar(row.id, {
            rangoMinimo: Number(row.rangoMinimo),
            rangoMaximo: Number(row.rangoMaximo),
            mensaje: row.mensaje,
          });
          const fila = tabla.data.find(r => r.id === row.id);
          Object.assign(fila, row);
        }
        tabla.editingRowId = null;
        tabla._render();
      } catch (err) {
        utilModalJuegos.mostrarMensajeModal('Error', err.message, false);
      }
    });



    tabla.addEventListener("row-delete-request", async (event) => {
      event.preventDefault();
      const idInterno = event.detail.id;
      const rowEl = tabla.shadowRoot.querySelector(`[data-row-id="${idInterno}"]`);
      const idReal = rowEl?.dataset.dbId;

      if (!idReal) {
        utilModalJuegos.mostrarMensajeModal('Mensaje', "No se encontró el ID del backend para eliminar.");
        return;
      }

      utilModalJuegos.mostrarMensajeModal(
        "Confirmar eliminación",
        "¿Seguro que quieres eliminar esta fila?",
        async () => {
          try {
            await RangoEvaluacionService.eliminar(idReal);

            tabla.data = tabla.data.filter(r => r._id !== idInterno);

            const totalPages = Math.max(1, Math.ceil(tabla.data.length / tabla.pageSize));
            if (tabla.page > totalPages) tabla.page = totalPages;

            tabla._render();

            utilModalJuegos.mostrarMensajeModal("Aviso", "Fila eliminada correctamente.");

          } catch (error) {
            utilModalJuegos.mostrarMensajeModal('Error', 'No se pudo eliminar.');
            console.error(error);
          }
        }
      );
    });

  });


  function validarRangoEvaluacion(min, max) {
    const minNum = Number(min);
    const maxNum = Number(max);

    if (min === "" || max === "")
      return { valido: false, mensaje: "Los campos no pueden estar vacíos." };

    if (isNaN(minNum) || isNaN(maxNum))
      return { valido: false, mensaje: "Rango mínimo y máximo deben ser números." };

    if (!Number.isInteger(minNum) || !Number.isInteger(maxNum))
      return { valido: false, mensaje: "Los valores deben ser números enteros." };

    if (minNum < 0 || maxNum < 0)
      return { valido: false, mensaje: "Los valores no pueden ser negativos." };

    if (minNum > maxNum)
      return { valido: false, mensaje: "El rango mínimo no puede ser mayor que el máximo." };

    return { valido: true };
  }

  // Para tablas que ya existen en el DOM al cargar la página
  if (tablaExistente) {
    // Dispatch manual para que se inicialice mediante el listener
    tablaExistente.dispatchEvent(new CustomEvent("tabla-rango-evaluacion", {
      bubbles: true,
      composed: true,
      detail: { tabla: tablaExistente }
    }));
  }
})();