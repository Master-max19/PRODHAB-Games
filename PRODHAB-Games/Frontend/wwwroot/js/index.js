    let todosLosJuegos = [];
      let juegosFiltrados = [];
      let paginaActual = 1;
      const juegosPorPagina = 6; // Cambia a 4 si quieres
      let filtroActual = "todos";

      async function obtenerJuegos() {
        try {
          const juegos = await juegoService.obtenerJuegos();
          return juegos.filter((j) => j.activo);
        } catch (error) {
          console.error("Error:", error);
          return [];
        }
      }

      function filtrarJuegos(tipo) {
        filtroActual = tipo;
        juegosFiltrados =
          tipo === "todos"
            ? [...todosLosJuegos]
            : todosLosJuegos.filter((j) => j.idTipoJuego.toString() === tipo);
        paginaActual = 1;
        mostrarJuegos();
      }

      function mostrarJuegos() {
        const grid = document.getElementById("juegosGrid");
        grid.innerHTML = "";

        const inicio = (paginaActual - 1) * juegosPorPagina;
        const fin = inicio + juegosPorPagina;
        const juegosPagina = juegosFiltrados.slice(inicio, fin);

        if (juegosPagina.length === 0) {
          grid.innerHTML =
            "<p style='text-align:center; color:var(--text-light); grid-column:1/-1; padding:2rem;'>No se encontraron juegos activos.</p>";
          document.getElementById("paginacion").innerHTML = "";
          return;
        }

        juegosPagina.forEach((juego) => {
          const tipoText =
            [
              "",
              "Test",
              "Ordenar Palabra",
              "Completar Texto",
              "Sopa de Letras",
            ][juego.idTipoJuego] || "Otro";
          const badgeClass = `badge-${juego.idTipoJuego}`;
          const icon = ["", "", "", "", ""][juego.idTipoJuego];

          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
          <div class="card-header">
            <h3>${juego.nombre}</h3>
          </div>
          <div class="card-body">
            <p><strong>Descripción:</strong> ${
              juego.descripcion || "Sin descripción"
            }</p>
            <p><strong>Detalle:</strong> ${juego.detalle || "N/A"}</p>
            <div class="badge ${badgeClass}">
              ${icon} ${tipoText}
            </div>
            <button class="btn-jugar">
              Jugar Ahora
            </button>
          </div>
        `;

          card
            .querySelector(".btn-jugar")
            .addEventListener("click", () => mostrarJuego(juego));
          grid.appendChild(card);
        });

        actualizarPaginacion();
      }

      function mostrarJuego(juego) {
        const container = document.querySelector(".container");
        container.innerHTML = `
        <div class="juego-activo juego-fullwidth">
          <button class="volver-btn" id="volverBtn">
            Volver al Catálogo
          </button>
          <div id="juegoContainer"></div>
        </div>
      `;

        document.body.classList.add("juego-abierto");
        document.getElementById("volverBtn").addEventListener("click", () => {
          document.body.classList.remove("juego-abierto");
          location.reload();
        });

        tipoJuegoTexto(juego.idTipoJuego, juego.idJuego);
      }

      function actualizarPaginacion() {
        const total = Math.ceil(juegosFiltrados.length / juegosPorPagina);
        const pag = document.getElementById("paginacion");
        if (total <= 1) {
          pag.innerHTML = "";
          return;
        }

        let html = `<button class="paginacion-btn" id="prevBtn" ${
          paginaActual === 1 ? "disabled" : ""
        }>Anterior</button>`;
        for (let i = 1; i <= total; i++) {
          html += `<button class="paginacion-btn ${
            i === paginaActual ? "active" : ""
          }" data-pagina="${i}">${i}</button>`;
        }
        html += `<button class="paginacion-btn" id="nextBtn" ${
          paginaActual === total ? "disabled" : ""
        }>Siguiente</button>`;
        pag.innerHTML = html;

        document.getElementById("prevBtn").onclick = () => {
          if (paginaActual > 1) {
            paginaActual--;
            mostrarJuegos();
          }
        };
        document.getElementById("nextBtn").onclick = () => {
          if (paginaActual < total) {
            paginaActual++;
            mostrarJuegos();
          }
        };
        document.querySelectorAll("[data-pagina]").forEach(
          (b) =>
            (b.onclick = () => {
              paginaActual = +b.dataset.pagina;
              mostrarJuegos();
            })
        );
      }

      async function inicializar() {
        todosLosJuegos = await obtenerJuegos();
        juegosFiltrados = [...todosLosJuegos];
        mostrarJuegos();

        document.querySelectorAll(".filtro-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            document
              .querySelectorAll(".filtro-btn")
              .forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            filtrarJuegos(btn.dataset.filtro);
          });
        });
      }

      function completar(id) {
        document.getElementById(
          "juegoContainer"
        ).innerHTML = `<div style="width:100%;"><completar-texto-component img-intro="public/images/superdato_1.png" webm-final="public/video/superdato_escribe.webm" img-rondas="public/images/superdato_manos_cintura.png" id-completar="${id}"></completar-texto-component></div>`;
      }
      function sopa(id) {
        document.getElementById(
          "juegoContainer"
        ).innerHTML = `<div style="width:100%;"><sopa-letras-component size="14" id-sopa="${id}" modal1-video="public/video/superdato_anotando.webm" modal2-video="public/video/superdato_idea.webm" superdato-img="public/images/superdato_señalando.png"></sopa-letras-component></div>`;
      }
      function test(id) {
        document.getElementById(
          "juegoContainer"
        ).innerHTML = `<test-component style-url="src/components/test/test.css" correcta_svg="public/images/correcta.svg" incorrecta_svg="public/images/incorrecta.svg" character_png="public/images/superdato_2.png" id-test="${id}"></test-component>`;
      }
      function ordenar(id) {
        document.getElementById(
          "juegoContainer"
        ).innerHTML = `<juego-ordena-letras-component id-ordenar="${id}" video-final-src="public/video/super_dato_sonrie.webm" inicio-video-src="public/video/super_dato_saluda.webm" style="width:100%;"></juego-ordena-letras-component>`;
      }
      function tipoJuegoTexto(t, id) {
        const map = { 1: test, 2: ordenar, 3: completar, 4: sopa };
        (map[t] || sopa)(id);
      }

      document.addEventListener("DOMContentLoaded", inicializar);