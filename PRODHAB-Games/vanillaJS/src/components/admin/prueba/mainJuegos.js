      const tabla = document.getElementById("tabla-juegos-component");
      const idTipoJuego = Number(tabla.serviceId);
      let juegoSeleccionado = -1;

      // Fetch games from API
      async function cargarJuegos(idTipoJuego = 1) {
        const columnas = [
          { key: "idJuego", label: "ID" },
          { key: "nombre", label: "Nombre" },
          { key: "descripcion", label: "Descripción" },
          { key: "detalle", label: "Detalle" },
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
              label: "Configurar",
              action: "ver",
              tooltip: "Visualizar el test",
            },
          ],
        };

        try {
          const data = await juegoService.obtenerJuegosPorTipo(idTipoJuego);
          console.log("API response:", data);

          // Normalizar claves y asegurar strings
          const dataString = data.map((item) => ({
            idJuego: String(item.idJuego ?? ""),
            nombre: String(item.nombre ?? item.Nombre ?? ""),
            descripcion: String(item.descripcion ?? item.Descripcion ?? ""),
            detalle: String(item.detalle ?? item.Detalle ?? ""),
          }));

          tabla.config = configBase;
          tabla.dataSource = dataString;
          tabla.errorMessage = "";
        } catch (err) {
          console.error("Error cargando datos:", err);
          tabla.config = configBase;
          tabla.dataSource = [];
          tabla.errorMessage = `Error al cargar los juegos: ${err.message}`;
        }

        tabla._render();
      }

      tabla.addEventListener("row-action", (e) => {
        if (e.detail.action === "ver") {
          console.log(e.detail.row.idJuego);
          juegoSeleccionado = Number(e.detail.row.idJuego);

          if (idTipoJuego === 1) {
            document.getElementById("contenedor").innerHTML = `    
 <admin-header-component title="${e.detail.row.nombre}"></admin-header-component>
    <form-test-component modo="registrar" service-id='${e.detail.row.idJuego}'></form-test-component>
    <test-viewer-component service-id='${e.detail.row.idJuego}'></test-viewer-component>
    <table-component id="tabla-rango-evaluacion" style="margin-bottom: 15px; margin-top: 25px;" service-id='${e.detail.row.idJuego}'></table-component>
`;
            const form = document.querySelector("form-test-component");
            const viewer = document.querySelector("test-viewer-component");
            if (form && viewer) {
              form.testViewer = viewer;
            }
          } else if (idTipoJuego === 2) {
            document.getElementById("contenedor").innerHTML = `
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
          sub-placeholder-text="Añadir opción..."
          save-button-text="Guardar Cambios"
          cancel-button-text="Cancelar"
          hide-pagination
          hide-add-item
          hide-delete-button
        ></admin-palabra-component>

  `;
          } else if (idTipoJuego === 3) {
            document.getElementById(
              "contenedor"
            ).innerHTML = `  <admin-header-component
          title="Completar texto"
          hide-buttons
        ></admin-header-component>
        <admin-palabra-component
          id="admin-completar-texto"
          title="Ajuste de rondas"
          add-button-text="Agregar"
          edit-button-text="Modificar"
          delete-button-text="Quitar"
          add-sub-button-text="Añadir opción"
          prev-button-text="Atrás"
          next-button-text="Adelante"
          confirm-delete-text="¿Eliminar este ítem?"
          items-per-page-label-text="Elementos por página:"
          sub-placeholder-text="Añadir opción..."
          save-button-text="Guardar Cambios"
          cancel-button-text="Cancelar"
   
        ></admin-palabra-component>`;
          } else if (idTipoJuego === 4) {
            document.getElementById("contenedor").innerHTML = `
  <admin-header-component
          title="Sopa de letras"
          hide-buttons
        ></admin-header-component>
        <admin-palabra-component
          id="admin-palabra-sopa-letras"
          title="Gestor de Preguntas"
          add-button-text="Agregar"
          edit-button-text="Modificar"
          delete-button-text="Quitar"
          add-sub-button-text="Añadir opción"
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
  `;
          }
        }
      });
      // Initialize the table
      async function initializeTablaTests(tabla) {
        if (!tabla || tabla.__initialized) {
          console.log("Tabla ya inicializada o no encontrada");
          return;
        }
        tabla.__initialized = true;
        console.log("Inicializando tabla");

        // Load initial data
        await cargarJuegos(idTipoJuego);

        // Handle save (add/edit)
        tabla.addEventListener("before-save-row", async (e) => {
          e.preventDefault();
          const { row, newValues } = e.detail;
          console.log("Saving row:", row, "New values:", newValues);

          // Validate nombre
          if (!newValues.nombre) {
            tabla.errorMessage = "El campo 'nombre' es obligatorio.";
            tabla._render();
            return;
          }

          try {
            if (row.idJuego && parseInt(row.idJuego) > 0) {
              // Update existing game (PUT)
              try {
                const updatedJuego = await juegoService.actualizarJuego(
                  row.idJuego,
                  {
                    idJuego: parseInt(row.idJuego),
                    nombre: newValues.nombre || row.nombre,
                    descripcion: newValues.descripcion || row.descripcion || "",
                    detalle: newValues.detalle || row.detalle || "",
                  }
                );

                console.log("Juego actualizado:", updatedJuego);
              } catch (err) {
                console.error(err.message);
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

                console.log("New game created:", newGame);

                Object.assign(row, {
                  idJuego: newGame.idJuego,
                });
              } catch (err) {
                console.error(err.message);
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
          const row = e.detail;
          console.log("Deleting row:", row);
          if (!row.idJuego || parseInt(row.idJuego) <= 0) {
            tabla.errorMessage =
              "No se encontró el ID del juego para eliminar.";
            tabla._render();
            e.preventDefault();
            return;
          }

          if (!confirm("¿Seguro que quieres eliminar este juego?")) {
            e.preventDefault();
            return;
          }

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
            e.preventDefault();
          }
        });

        tabla.addEventListener("refresh-table", async () => {
          console.log("Refreshing table");
          await cargarJuegos(idTipoJuego);
        });
      }

      if (tabla) {
        console.log("Tabla encontrada, inicializando...");
        initializeTablaTests(tabla);
      } else {
        console.log("Tabla no encontrada, iniciando MutationObserver");
        const observer = new MutationObserver((mutations, obs) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (node.id === "tabla-test-component") {
                console.log("Tabla detectada por MutationObserver");
                initializeTablaTests(node);
                obs.disconnect();
                return;
              }
            }
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }