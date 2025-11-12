/**
 * ==============================
 * Variables globales
 * ==============================
 */

/**
 * @namespace window.prodhab_juegos
 * @description Objeto global que guarda información del juego seleccionado
 * @externo Sí, proviene del objeto global window
 */

/**
 * @property window.prodhab_juegos.juegoSeleccionado
 * @type {number}
 * @description ID del juego actualmente seleccionado
 * @default 0
 */

/**
 * ==============================
 * Funciones internas
 * ==============================
 */

/**
 * @function crearTablaDinamica
 * @async
 * @param {number} idTipoJuego - Tipo de juego
 * @param {string} idContenedor - ID del contenedor donde se renderiza la tabla
 * @param {string} title - Título que se muestra en el header
 * @description Crea dinámicamente una tabla de juegos según el tipo, agrega header, wrapper y configura eventos de fila.
 * @externo No, definida localmente
 */

/**
 * @function renderResumentActividad
 * @param {number} idJuego
 * @returns {string} HTML de componente resumen de actividad
 * @description Genera un componente `<resumen-actividad-component>` con información del juego
 * @externo No, definida localmente
 */

/**
 * @function cargarJuegos
 * @async
 * @param {number} [idTipoJuego=1]
 * @description Carga los juegos desde el servicio y los asigna al componente tabla
 * @externo No, definida localmente
 */

/**
 * ==============================
 * Servicios / funciones externas
 * ==============================
 */

/**
 * @function juegoService.obtenerJuegosPorTipo
 * @async
 * @description Obtiene los juegos del backend según el tipo
 * @externo Sí, proviene de servicio externo
 */

/**
 * @function juegoService.actualizarJuego
 * @async
 * @description Actualiza un juego existente en backend
 * @externo Sí, proviene de servicio externo
 */

/**
 * @function juegoService.crearJuego
 * @async
 * @description Crea un nuevo juego en backend
 * @externo Sí, proviene de servicio externo
 */

/**
 * @function juegoService.eliminarJuego
 * @async
 * @description Elimina un juego en backend
 * @externo Sí, proviene de servicio externo
 */

/**
 * @function utilModalJuegos.mostrarMensajeModal
 * @description Muestra un modal de confirmación o mensaje
 * @externo Sí, proviene de utilitario externo
 */

/**
 * ==============================
 * Propiedades / configuración del componente
 * ==============================
 */

/**
 * @property tabla.id
 * @type {string}
 * @description ID del componente tabla generado dinámicamente
 */

/**
 * @property tabla.config
 * @type {object}
 * @description Configuración de columnas, botones y acciones externas de la tabla
 */

/**
 * @property tabla.dataSource
 * @type {Array}
 * @description Datos que se muestran en la tabla
 */

/**
 * @property tabla.errorMessage
 * @type {string}
 * @description Mensaje de error mostrado en la tabla
 */

/**
 * ==============================
 * Eventos del componente tabla
 * ==============================
 */

/**
 * @event row-action
 * @description Se dispara al ejecutar una acción externa de la fila (ej. ver, ajustes)
 */

/**
 * @event before-save-row
 * @description Se dispara antes de guardar los cambios de una fila. Permite validar o cancelar el guardado
 */

/**
 * @event before-delete-row
 * @description Se dispara antes de eliminar una fila. Permite mostrar confirmación
 */

/**
 * @event refresh-table
 * @description Se dispara cuando se solicita refrescar la tabla
 */

/**
 * ==============================
 * Elementos del DOM locales
 * ==============================
 */

/**
 * @type {HTMLElement} contenedor
 * @description Contenedor donde se agrega el wrapper de la tabla y el header
 */

/**
 * @type {HTMLElement} header
 * @description Componente header dinámico (`<admin-header-component>`)
 */

/**
 * @type {HTMLElement} wrapper
 * @description Contenedor de la tabla (`div`) con clase `tabla-wrapper`
 */

/**
 * @type {HTMLElement} tabla
 * @description Componente de tabla dinámico (`<simple-table-component>`)
 */




window.prodhab_juegos = window.prodhab_juegos || {};
window.prodhab_juegos.juegoSeleccionado = 0;

(() => {
    const tipoJuego = Object.freeze({
        TEST: 1,
        ORDENAR_PALABRAS: 2,
        COMPLETAR_TEXTO: 3,
        SOPA_LETRAS: 4
    });

    async function crearTablaDinamica(idTipoJuego, idContenedor, title) {
        const contenedor = document.getElementById(idContenedor);

        contenedor.innerHTML = "";


        const header = document.createElement("admin-header-component");
        header.setAttribute("title", title);
        header.setAttribute("hide-buttons", "");

        contenedor.appendChild(header);

        const wrapper = document.createElement("div");
        wrapper.className = "tabla-wrapper";
        wrapper.id = `wrapper-tabla-${idTipoJuego}`;
        contenedor.appendChild(wrapper);

        const tabla = document.createElement("simple-table-component");
        tabla.id = `tabla-juegos-${idTipoJuego}`;
        tabla.setAttribute("service-id", idTipoJuego);
        wrapper.appendChild(tabla);
        const columnas = [
            { key: "idJuego", label: "ID" },
            { key: "nombre", label: "Nombre" },
            { key: "descripcion", label: "Descripción" },
            { key: "detalle", label: "Detalle" },
            { key: "activo", label: "Estado" }
        ];

        const configBase = {
            columns: columnas,
            editableColumns: ["nombre", "descripcion", "detalle"],
            showAdd: true,
            showEdit: true,
            showDelete: true,
            showRefresh: true,
            externalActions: [
                {
                    label: "👁 Estado",
                    action: "ver-estado",
                    tooltip: "Controla la visibilidad del test",
                },
                {
                    label: "⚙ Ajustes",
                    action: "ver",
                    tooltip: "Visualizar el test",
                },

            ],
        };


        function renderResumentActividad(idJuego) {
            return `<resumen-actividad-component
                    style="margin-bottom: 25px; margin-top: 25px;"
                    id-juego="${idJuego}"
                    label-mes="Actividad del mes actual"
                    label-30dias="Actividad últimos 30 días"
                    label-promedio="Calificación promedio (Últimos 30 días)"
                    tooltip-mes="Cantidad de actividades del mes actual (UTC)"
                    tooltip-30dias="Cantidad de actividades últimos 30 días (UTC)"
                    tooltip-promedio="Calificación promedio de los últimos 30 días (UTC)"
                    ></resumen-actividad-component>
`;




        }

        async function cargarJuegos(idTipoJuego = 1) {
            try {
                const data = await juegoService.obtenerJuegosPorTipo(idTipoJuego);
                const dataString = data.map((item) => ({
                    idJuego: String(item.idJuego ?? ""),
                    nombre: String(item.nombre ?? item.Nombre ?? ""),
                    descripcion: String(item.descripcion ?? item.Descripcion ?? ""),
                    detalle: String(item.detalle ?? item.Detalle ?? ""),
                    activo: item.activo == true ? 'activo' : 'inactivo'
                }));

                tabla.config = configBase;
                tabla.dataSource = dataString;
                tabla.errorMessage = "";
            } catch (err) {
                tabla.config = configBase;
                tabla.dataSource = [];
                tabla.errorMessage = "No hay juegos disponibles.";
            }

            tabla._render();
        }

        await cargarJuegos(idTipoJuego);


        tabla.addEventListener("row-action", async (e) => {
            const datos = e.detail.row;
            let idJuegoSeleccionado = datos.idJuego;

            if (e.detail.action === "ver-estado") {
                const estadoActual = datos.activo === 'activo';
                const nuevoEstado = !estadoActual;

                utilModalJuegos.mostrarMensajeModal(
                    `El estado actual es: ${datos.activo}`,
                    `¿Deseas cambiarlo a: ${nuevoEstado ? 'activo' : 'inactivo'}?`,
                    async () => {
                        await juegoService.actualizarJuego(datos.idJuego, {
                            activo: nuevoEstado
                        });
                        await cargarJuegos(idTipoJuego); // recarga la tabla

                    }
                );
            }


            if (e.detail.action === "ver") {
                window.prodhab_juegos.juegoSeleccionado = Number(idJuegoSeleccionado);

                if (idTipoJuego === tipoJuego.TEST) {
                    document.getElementById(idContenedor).innerHTML = `    
 <admin-header-component title="${e.detail.row.nombre}"></admin-header-component>
    <form-test-component modo="registrar" service-id='${idJuegoSeleccionado}'></form-test-component>
    <test-viewer-component service-id='${idJuegoSeleccionado}'></test-viewer-component>
    <table-component id="tabla-rango-evaluacion" style="margin-bottom: 15px; margin-top: 25px;" service-id='${idJuegoSeleccionado}'></table-component>
                   ${renderResumentActividad(idJuegoSeleccionado)}
`;
                    const form = document.querySelector("form-test-component");
                    const viewer = document.querySelector("test-viewer-component");
                    if (form && viewer) {
                        form.testViewer = viewer;
                    }
                } else if (idTipoJuego === tipoJuego.ORDENAR_PALABRAS) {
                    document.getElementById(idContenedor).innerHTML = `
  <admin-header-component
          title="Ordenar palabras"
          hide-buttons
        ></admin-header-component>
        <admin-palabra-component
          id="admin-ordenar-palabras"
          add-button-text="Agregar"
          edit-button-text="Modificar"
          delete-button-text="Quitar"
          add-sub-button-text="Añadir opción"
          prev-button-text="Atrás"
          next-button-text="Adelante"
          confirm-delete-text="¿Eliminar este ítem?"
          items-per-page-label-text="Elementos por página:"
          sub-placeholder-text="Añadir una palabra..."
          save-button-text="Guardar Cambios"
          cancel-button-text="Cancelar"
          hide-pagination
          hide-add-item
          hide-delete-button
        ></admin-palabra-component>
                   ${renderResumentActividad(idJuegoSeleccionado)}

  `;
                } else if (idTipoJuego === tipoJuego.COMPLETAR_TEXTO) {
                    document.getElementById(
                        idContenedor).innerHTML = `  <admin-header-component
          title="Completar texto"
          hide-buttons
        ></admin-header-component>
        <admin-palabra-component
          id="admin-completar-texto"
          title="Ajuste de rondas"
          add-button-text="Agregar"
          edit-button-text="Modificar"
          delete-button-text="Quitar"
          add-sub-button-text="Añadir palabra"
          prev-button-text="Atrás"
          next-button-text="Adelante"
          confirm-delete-text="¿Eliminar este ítem?"
          items-per-page-label-text="Elementos por página:"
          sub-placeholder-text="Añadir una palabra..."
          save-button-text="Guardar Cambios"
          cancel-button-text="Cancelar"
          placeholder-text="Crear una nueva ronda..."

   
        ></admin-palabra-component>
                   ${renderResumentActividad(idJuegoSeleccionado)}
`;
                } else if (idTipoJuego === tipoJuego.SOPA_LETRAS) {
                    document.getElementById(idContenedor).innerHTML = `
        <admin-header-component
          title="Sopa de letras"
          hide-buttons>
          </admin-header-component>
          <admin-palabra-component
          id="admin-palabra-sopa-letras"
          title="Gestor de Preguntas"
          add-button-text="Agregar"
          edit-button-text="Modificar"
          delete-button-text="Quitar"
          add-sub-button-text="Añadir palabra"
          prev-button-text="Atrás"
          next-button-text="Adelante"
          confirm-delete-text="¿Eliminar este ítem?"
          items-per-page-label-text="Elementos por página:"
          sub-placeholder-text="Añadir opción..."
          save-button-text="Guardar Cambios"
          cancel-button-text="Cancelar"
          hide-pagination
          hide-add-item
          hide-delete-button
        ></admin-palabra-component>
                   ${renderResumentActividad(idJuegoSeleccionado)}

  `;
                }
            }
        });



        tabla.addEventListener("before-save-row", async (e) => {
            e.preventDefault();
            const { row, newValues } = e.detail;

            if (!newValues.nombre || newValues.nombre.trim() === "") {
                tabla.errorMessage = "El campo 'nombre' es obligatorio.";
                tabla._render();
                return;
            }
            if (newValues.nombre.length > 100) {
                tabla.errorMessage = "El nombre no puede superar los 100 caracteres.";
                tabla._render();
                return;
            }

            if (newValues.descripcion && newValues.descripcion.length > 500) {
                tabla.errorMessage = "La descripción no puede superar los 500 caracteres.";
                tabla._render();
                return;
            }

            if (newValues.detalle && newValues.detalle.length > 500) {
                tabla.errorMessage = "El detalle no puede superar los 500 caracteres.";
                tabla._render();
                return;
            }

            try {
                if (row.idJuego && parseInt(row.idJuego) > 0) {
                    try {
                        await juegoService.actualizarJuego(
                            row.idJuego,
                            {
                                idJuego: parseInt(row.idJuego),
                                nombre: newValues.nombre || row.nombre,
                                descripcion: newValues.descripcion !== undefined ? newValues.descripcion : row.descripcion,
                                detalle: newValues.detalle !== undefined ? newValues.detalle : row.detalle,

                            }
                        );

                    } catch (err) {
                        utilModalJuegos.mostrarMensajeModal('Error', err.message, false);

                    }
                } else {
                    try {
                        const newGame = await juegoService.crearJuego({
                            nombre: newValues.nombre,
                            descripcion: newValues.descripcion || "",
                            detalle: newValues.detalle || "",
                            activo: true,
                            idTipoJuego: idTipoJuego,
                        });


                        Object.assign(row, {
                            idJuego: newGame.idJuego,
                        });
                    } catch (err) {
                        utilModalJuegos.mostrarMensajeModal('Error', err.message, false);

                    }
                }

                Object.assign(row, newValues);
                tabla.editingId = null;
                tabla.errorMessage = "";
                tabla._render();

                await cargarJuegos(idTipoJuego);

                tabla.dispatchEvent(
                    new CustomEvent("save-row", {
                        detail: row,
                        bubbles: true,
                        composed: true,
                    })
                );
            } catch (err) {
                console.error("Error al guardar:", err);
                tabla.errorMessage = `Error al guardar: ${err.message}`;
                tabla._render();
            }
        });



        tabla.addEventListener("before-delete-row", async (e) => {
            e.preventDefault();
            const row = e.detail;

            if (!row.idJuego || parseInt(row.idJuego) <= 0) {
                tabla.errorMessage = "No se encontró el ID del juego para eliminar.";
                tabla._render();
                return;
            }
            utilModalJuegos.mostrarMensajeModal(
                "Confirmar eliminación",
                `¿Seguro que quieres eliminar este juego?`,
                async () => {
                    try {
                        await juegoService.eliminarJuego(row.idJuego);
                        await cargarJuegos(idTipoJuego);

                        tabla.dispatchEvent(
                            new CustomEvent("delete-row", {
                                detail: row,
                                bubbles: true,
                                composed: true,
                            })
                        );
                    } catch (error) {
                        console.error("Error al eliminar:", error);
                        tabla.errorMessage = `Error al eliminar: ${error.message}`;
                        tabla._render();
                    }
                }
            );
        });


        tabla.addEventListener("refresh-table", async () => {
            await cargarJuegos(idTipoJuego);
        });
    }

    window.prodhab_juegos.crearTablaDinamica = crearTablaDinamica;

})();