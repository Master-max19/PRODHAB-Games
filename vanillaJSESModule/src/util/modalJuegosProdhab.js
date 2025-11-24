import { getAtributos } from '../juegosAssets.js';

export function aplicarEstilosResponsive(closeBtn) {
function ajustar() {
  if (window.innerWidth <= 600) {
    // MÓVIL
    closeBtn.style.border = "none";
    closeBtn.style.boxShadow = "none";
    closeBtn.style.backgroundColor = "white";
    closeBtn.style.marginRight = "2px";
    closeBtn.style.fontSize = "0.8rem";
    closeBtn.style.padding = "0.2rem 0.6rem";
    closeBtn.textContent = "✖";
  } else {
    // DESKTOP
    closeBtn.style.boxShadow = "none"; // sin sombra
    closeBtn.style.border = "2px solid rgba(0,0,0,0.2)"; // borde suave
    closeBtn.style.borderRadius = "0.8rem";
    closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
    closeBtn.style.fontSize = "1rem";
    closeBtn.style.padding = "0.5rem 1rem";
    closeBtn.textContent = "✖ Cerrar";
  }
}

  window.addEventListener("resize", ajustar);
  ajustar();
}

export async function openAutoModal(htmlContent) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
    backdropFilter: "blur(2px)",
  });

  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed",
    inset: "0",
    background: "#ffffff",
    padding: "30px 0 20px 0",
    margin: "5px",
    overflowY: "auto",
    borderRadius: "15px",
  });
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  

  const closeBtn = document.createElement("button");
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "1%",
    right: "1%",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.2s",
  });
  closeBtn.textContent = "✖ Cerrar";
  closeBtn.onmouseover = () => closeBtn.style.transform = "scale(1.05)";
  closeBtn.onmouseout = () => closeBtn.style.transform = "scale(1)";
  closeBtn.onclick = () => closeAutoModal(overlay);

  const content = document.createElement("div");
  Object.assign(content.style, {
    maxWidth: "100%",
    width: "auto",
    minWidth: "0",
    boxSizing: "border-box",
    wordWrap: "break-word",
    wordBreak: "break-word",
    marginTop: "5px",
  });
  content.tabIndex = 0;
  content.innerHTML = htmlContent;

  modal.appendChild(closeBtn);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  overlay.onclick = (e) => { if (e.target === overlay) closeAutoModal(overlay); }

  const tables = content.querySelectorAll("table");
  tables.forEach(t => {
    const wrap = document.createElement("div");
    wrap.style.overflowX = "auto";
    t.parentNode.insertBefore(wrap, t);
    wrap.appendChild(t);
  });

  aplicarEstilosResponsive(closeBtn);
}

export function closeAutoModal(overlay) {
  if (overlay) overlay.remove();
  document.body.style.overflow = "auto";
}

export function openAutoModalGames(idJuego, idTipoJuego) {
  const tipo = Number(idTipoJuego);
  const config = getAtributos(tipo);
  if (!config) return;

  let juegoHTML = "";

  switch (tipo) {
    case 1:
      juegoHTML = `<test-component 
        id-test="${idJuego}" 
        correcta_svg="${config.correcta_svg}" 
        incorrecta_svg="${config.incorrecta_svg}" 
        character_png="${config.character_png}">
      </test-component>`;
      break;

    case 2:
      juegoHTML = `<juego-ordena-letras-component 
        id-ordenar="${idJuego}" 
        video-final-src="${config.video_final_src}" 
        inicio-video-src="${config.inicio_video_src}">
      </juego-ordena-letras-component>`;
      break;

    case 3:
      juegoHTML = `<completar-texto-component 
        id-completar="${idJuego}" 
        img-intro="${config.img_intro}" 
        webm-final="${config.webm_final}" 
        img-rondas="${config.img_rondas}">
      </completar-texto-component>`;
      break;

    case 4:
      juegoHTML = `<sopa-letras-component 
        id-sopa="${idJuego}" 
        modal1-video="${config.modal1_video}" 
        modal2-video="${config.modal2_video}" 
        superdato-img="${config.superdato_img}">
      </sopa-letras-component>`;
      break;
  }

  openAutoModal(juegoHTML);
}
