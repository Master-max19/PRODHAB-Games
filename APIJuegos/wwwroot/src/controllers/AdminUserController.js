// archivo: tablaUsuariosController.js
// ES Module

import { obtenerUsuarios, eliminarUsuario } from '../services/usuarioService.js';
import { mostrarMensajeModal } from '../util/juegoFunctionUtility.js';

export async function cargarDatosUsuarios(tablaUsuarioComponent) {
  if (!tablaUsuarioComponent) return;

  const data = await obtenerUsuarios();
  tablaUsuarioComponent.dataSource = data;
}

export function inicializarTablaUsuarios() {
  const tablaUsuarioComponent = document.getElementById("tabla-usuario-component");

  if (!tablaUsuarioComponent) return;

  // Cargar datos iniciales si hay sesión
  if (sessionStorage.getItem("sesion_admin_juegos_prodhab")) {
    cargarDatosUsuarios(tablaUsuarioComponent);
  }

  tablaUsuarioComponent.config = {
    showAdd: false,
    showEdit: false,
    showDelete: true,
    showRefresh: true,
    columns: ["correo", "estado", "rol"],
  };

  // Eliminar usuario
  tablaUsuarioComponent.addEventListener("before-delete-row", async (e) => {
    e.preventDefault();
    const correo = e.detail.correo;

    mostrarMensajeModal(
      "Confirmar eliminación",
      `¿Seguro que quieres eliminar el usuario ${correo}?`,
      async () => {
        const ok = await eliminarUsuario(correo);
        if (ok) {
          mostrarMensajeModal("Aviso", "Usuario eliminado");
          await cargarDatosUsuarios(tablaUsuarioComponent);
        } else {
          mostrarMensajeModal("Error", "No se pudo eliminar el usuario");
        }
      }
    );
  });

  // Recargar tabla
  tablaUsuarioComponent.addEventListener("refresh-table", () => {
    cargarDatosUsuarios(tablaUsuarioComponent);
  });
}
