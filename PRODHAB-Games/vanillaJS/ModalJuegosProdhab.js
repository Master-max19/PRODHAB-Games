 const ModalMenuJuegosPRODHAB = (() => {
     

        // Función para cargar CSS externo y esperar
        function loadCSS(filename) {
          return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = filename;
            link.onload = () => resolve();
            link.onerror = () => reject();
            document.head.appendChild(link);
          });
        }

        async function openAutoModal(etiqueta) {
          try {
            await loadCSS("testets.css"); // tu CSS externo
          } catch {
            console.warn("No se pudo cargar el CSS externo");
          }

          const htmlContent =etiqueta;

          const overlay = document.createElement("div");
          overlay.className = "autoModal-overlay";

          const modal = document.createElement("div");
          modal.className = "autoModal";
          modal.setAttribute("role", "dialog");
          modal.setAttribute("aria-modal", "true");

          // Botón cerrar
          const closeBtn = document.createElement("button");
          closeBtn.className = "autoModal-close";
          // closeBtn.textContent = "✖ Cerrar";

          const content = document.createElement("div");
          content.className = "autoModal-content";
          content.tabIndex = 0;
          content.innerHTML = htmlContent;

          modal.appendChild(closeBtn);
          modal.appendChild(content);
          overlay.appendChild(modal);
          document.body.appendChild(overlay);
          document.body.style.overflow = "hidden";

          forceResponsive(content);

          // Listeners
    
          closeBtn.onclick = () => closeAutoModal(overlay);
          overlay.onclick = (e) => {
            if (e.target === overlay) closeAutoModal(overlay);
          };
        }

        function closeAutoModal(overlay) {
          if (overlay) overlay.remove();
          document.body.style.overflow = "auto";

        }


        function forceResponsive(root) {
          const tables = root.querySelectorAll("table");
          tables.forEach((t) => {
            const wrap = document.createElement("div");
            wrap.className = "table-wrap";
            t.parentNode.insertBefore(wrap, t);
            wrap.appendChild(t);
          });
        }

        return { openAutoModal };
      })();