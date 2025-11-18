/**
 * ==============================
 * Variables / elementos del DOM
 * ==============================
 */

/** 
 * @type {HTMLElement} tablaUsuarioComponent
 * @description Componente de tabla de usuarios en el DOM
 * @externo Sí, proviene del DOM
 */

/** 
 * @type {Storage} sessionStorage
 * @description Almacenamiento del navegador
 * @externo Sí, global del navegador
 */

/** 
 * @type {Event} e
 * @description Evento pasado en listeners del componente
 * @externo Sí, proviene de la UI / componente
 */


/**
 * ==============================
 * Funciones internas
 * ==============================
 */

/**
 * @function cargarDatosUsuarios
 * @description Función async que obtiene los usuarios desde el servicio y los asigna a la tabla
 * @externo No, definida localmente
 */

/**
 * @method addEventListener
 * @description Método usado para escuchar eventos en el componente
 * @externo Sí, proviene del DOM / componente
 */

/**
 * @method preventDefault
 * @description Método del evento para evitar comportamiento por defecto
 * @externo Sí, proviene del objeto Event
 */


/**
 * ==============================
 * Servicios / funciones externas
 * ==============================
 */

/**
 * @function usuarioService.obtenerUsuarios
 * @description Obtiene la lista de usuarios desde el backend
 * @externo Sí, proviene de servicio externo
 */

/**
 * @function usuarioService.eliminarUsuario
 * @description Elimina un usuario en el backend
 * @externo Sí, proviene de servicio externo
 */

/**
 * @function utilModalJuegos.mostrarMensajeModal
 * @description Muestra un modal de mensaje o confirmación
 * @externo Sí, proviene de utilitario externo
 */


/**
 * ==============================
 * Propiedades / configuración del componente
 * ==============================
 */

/**
 * @property tablaUsuarioComponent.config
 * @description Objeto para configurar botones visibles y columnas de la tabla
 * @externo No, propiedad interna del componente
 */

/**
 * @property tablaUsuarioComponent.dataSource
 * @description Arreglo con los datos que muestra la tabla
 * @externo No, propiedad interna del componente
 */


/**
 * ==============================
 * Eventos del componente
 * ==============================
 */

/**
 * @event before-delete-row
 * @description Evento que se dispara antes de eliminar un usuario
 * @externo Sí, disparado por el componente
 */

/**
 * @event refresh-table
 * @description Evento que se dispara para refrescar los datos de la tabla
 * @externo Sí, disparado por el componente
 */

(() => {

  const tablaUsuarioComponent = document.getElementById("tabla-usuario-component");

  async function cargarDatosUsuarios() {
    if (tablaUsuarioComponent) {

      const data = await usuarioService.obtenerUsuarios();
      tablaUsuarioComponent.dataSource = data;
    }
  }

  window.TablaUsuariosController = {
    cargarDatos: cargarDatosUsuarios
  };

  if (tablaUsuarioComponent) {
    tablaUsuarioComponent.config = {
      showAdd: false,
      showEdit: false,
      showDelete: true,
      showRefresh: true,
      columns: ["correo", "estado", "rol"],
    };


    if (sessionStorage.getItem("sesion_admin_juegos_prodhab")) {
      cargarDatosUsuarios();
    }

    tablaUsuarioComponent.addEventListener("before-delete-row", async (e) => {
      e.preventDefault();

      const correo = e.detail.correo;

      utilModalJuegos.mostrarMensajeModal(
        "Confirmar eliminación",
        `¿Seguro que quieres eliminar el usuario ${correo}?`,
        async () => {
          const ok = await usuarioService.eliminarUsuario(correo);
          if (ok) {
            utilModalJuegos.mostrarMensajeModal("Aviso", "Usuario eliminado");
            cargarDatosUsuarios();

          } else {
            utilModalJuegos.mostrarMensajeModal("Error", "No se pudo eliminar el usuario");
          }
        }
      );
    });


    tablaUsuarioComponent.addEventListener("refresh-table", () => {
      cargarDatosUsuarios();
    });
  }

})();