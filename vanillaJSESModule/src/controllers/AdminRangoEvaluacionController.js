// archivo: modules/tabla-rango-evaluacion.js
// tipo ES Module

import { obtenerPorJuego, crear, editar,eliminar } from "../../src/services/rangoEvaluacionService.js"
import { mostrarMensajeModal } from '../util/juegoFunctionUtility.js';
import { getJuegoSeleccionado} from "../controllers/AdminJuegosController.js";


const tablaExistente = document.getElementById("tabla-rango-evaluacion");

export function inicializarTablaRangoEvaluacion() {

  document.addEventListener("tabla-rango-evaluacion", async (e) => {

    const idJuego = getJuegoSeleccionado();
    const tabla = e.detail.tabla;
    if (!tabla || tabla.__initialized) return;
    tabla.__initialized = true;

    tabla.hiddenColumns = ["id", "idJuego"];
    tabla.columnNames = { rangoMaximo: "Rango máximo", rangoMinimo: "Rango mínimo" };

    const cargarDatos = async () => {
      try {
        const data = await obtenerPorJuego(idJuego);
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

    await cargarDatos();

    // Guardar fila
    tabla.addEventListener("row-save-request", async (event) => {
      event.preventDefault();
      const { row, isNew, id } = event.detail;

      const { valido, mensaje } = validarRangoEvaluacion(row.rangoMinimo, row.rangoMaximo);
      if (!valido) {
        mostrarMensajeModal("Error", mensaje);
        return;
      }

      try {
        if (isNew) {
          const creado = await crear({
            rangoMinimo: Number(row.rangoMinimo),
            rangoMaximo: Number(row.rangoMaximo),
            mensaje: row.mensaje,
          }, idJuego);

          const fila = tabla.data.find(r => r._id === id);
          Object.assign(fila, { ...row, id: creado.idRangoEvaluacion });
          delete fila._isNew;
        } else {
          await editar(row.id, {
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
        mostrarMensajeModal('Error', err.message, false);
      }
    });

    // Eliminar fila
    tabla.addEventListener("row-delete-request", async (event) => {
      event.preventDefault();
      const idInterno = event.detail.id;
      const rowEl = tabla.shadowRoot.querySelector(`[data-row-id="${idInterno}"]`);
      const idReal = rowEl?.dataset.dbId;

      if (!idReal) {
        mostrarMensajeModal('Mensaje', "No se encontró el ID del backend para eliminar.");
        return;
      }

      mostrarMensajeModal(
        "Confirmar eliminación",
        "¿Seguro que quieres eliminar esta fila?",
        async () => {
          try {
            await eliminar(idReal);
            tabla.data = tabla.data.filter(r => r._id !== idInterno);
            const totalPages = Math.max(1, Math.ceil(tabla.data.length / tabla.pageSize));
            if (tabla.page > totalPages) tabla.page = totalPages;
            tabla._render();
            mostrarMensajeModal("Aviso", "Fila eliminada correctamente.");
          } catch (error) {
            mostrarMensajeModal('Error', 'No se pudo eliminar.');
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

  // Inicializar tabla existente si ya está en el DOM
  if (tablaExistente) {
    tablaExistente.dispatchEvent(new CustomEvent("tabla-rango-evaluacion", {
      bubbles: true,
      composed: true,
      detail: { tabla: tablaExistente }
    }));
  }
}
