


import { inicializarLogin } from './controllers/LoginController.js';
import { inicializarTablaUsuarios } from './controllers/AdminUserController.js';
import { inicializarSidenav } from './controllers/AdminSideNavController.js';
import { inicializarAdminUserPanel } from './controllers/AdminUserPanelController.js';
import { inicializarTablaRangoEvaluacion } from './controllers/AdminRangoEvaluacionController.js';
import { inicializarSopaLetras } from './controllers/AdminSopaLetrasController.js';
import { inicializarOrdenarPalabras } from './controllers/AdminOrdenarPalabrasController.js';
import { inicializarCompletarTexto } from './controllers/AdminCompletarTextoController.js';
import { Test } from './components/test/test.js';
import { TestComponent } from './components/test/test-component.js';
import { OrdenaLetrasComponent } from './components/ordena-palabra-component/ordena-letras-component.js';
import { JuegoOrdenaLetras } from './components/ordena-palabra-component/juego-ordena-letras-component.js';
import { IntroAdivinaComponent } from './components/ordena-palabra-component/intro-adivina-component.js';
import { CompletarTextoComponent } from './components/completar/completar-texto-component.js';
import { SopaLetrasComponent } from './components/sopa-letras-component/sopa-letras-component.js';
import { ModalSopa } from './components/sopa-letras-component/modal-sopa.js';
import { TableComponent } from './components/table-component/TableComponent.js';
import { FormTestComponent } from './components/form-test-component/FormTestComponent.js';
import { AdminHeaderComponent } from './components/admin-header-component/AdminHeaderComponent.js';
import { TestViewerComponent } from './components/test-viewer-component/TestViewerComponent.js';
import { SidenavComponent } from './components/side-nav-component/SideNavComponent.js';
import { AdminUserPanelComponent } from './components/admin-user-panel-component/AdminUserPanelComponent.js';
import { SimpleTableComponent } from './components/simple-table-component/SimpleTableComponent.js';
import { ResumenActividadComponent } from './components/actividad-component/ResumenActividadComponent.js';
import { LoginCardComponent } from './components/login/login-card-component.js';
import { ModalComponent } from './components/modal/modal-component.js';
import { AdminPalabraComponent } from './components/admin-palabras-component/AdminPalabrasComponent.js';
import { openAutoModal } from './util/modalJuegosProdhab.js';
import { MenuJuegosComponent } from './components/menu-juegos-component/menu-juegos-component.js';
import { getAtributos } from './juegosAssets.js';

export function inyectarModuloAministradorjuegosPRODHAB(selector) {
  const elemento = document.querySelector(selector);
  if (elemento) {
    elemento.innerHTML = `
        <div
          class="fondo-login"
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: #1f4388;
          "
        >
          <login-card-component
            style="--accent: #1f4388; --accent-hover: #001f43"
          ></login-card-component>
        </div>

        <side-nav-component style="display: none" id="admin-side-nav-menu">
          <div
            id="id-admin-juegos-sidenav-option0"
            class="admin-juegos-sidenav-option"
          >
            <admin-header-component
              title="Administrador de Juegos"
              hide-buttons
            ></admin-header-component>

            <div
              style="
                margin-top: 20px;
                font-size: 18px;
                color: #333;
                text-align: center;
                font-family: 'Raleway', Arial, sans-serif;
              "
            >
              Bienvenido al módulo Administrador de Juegos.
            </div>
          </div>

          <div
            id="id-admin-juegos-sidenav-option1"
            class="admin-juegos-sidenav-option"
          >
            <admin-header-component
              title="Administrar usuarios"
              hide-buttons
            ></admin-header-component>

            <admin-user-panel></admin-user-panel>

            <simple-table-component
              id="tabla-usuario-component"
            ></simple-table-component>
          </div>

          <div id="id-admin-juegos-sidenav-option2" class="admin-juegos-sidenav-option"></div>
          <div id="id-admin-juegos-sidenav-option3" class="admin-juegos-sidenav-option"></div>
          <div id="id-admin-juegos-sidenav-option4" class="admin-juegos-sidenav-option"></div>
          <div id="id-admin-juegos-sidenav-option5" class="admin-juegos-sidenav-option"></div>
        </side-nav-component>

        <modal-component id="modal-admin-crud"></modal-component>
      `;
    inicializarLogin();
    inicializarTablaUsuarios();
    inicializarSidenav();
    inicializarAdminUserPanel();
    inicializarTablaRangoEvaluacion();
    inicializarSopaLetras();
    inicializarOrdenarPalabras();
    inicializarCompletarTexto();
  }
}


export function openMenuJuegos() {
  const assetsJuego1 = getAtributos(1);// contiene correcta_svg, incorrecta_svg, character_png
  const assetsJuego2 = getAtributos(2);
  const assetsJuego3 = getAtributos(3);
  const assetsJuego4 = getAtributos(4);
  const assetsJuego5 = getAtributos(5);


  openAutoModal(`
        <menu-juegos-component
            correcta-svg='${assetsJuego1.correcta_svg}'
            incorrecta-svg='${assetsJuego1.incorrecta_svg}'
            character-png='${assetsJuego1.character_png}'
            video-final-src='${assetsJuego2.video_final_src}'
            inicio-video-src='${assetsJuego2.inicio_video_src}'
            img-intro='${assetsJuego3.img_intro}'
            webm-final='${assetsJuego3.webm_final}'
            img-rondas='${assetsJuego3.img_rondas}'
            modal1-video='${assetsJuego4.modal1_video}'
            modal2-video='${assetsJuego4.modal2_video}'
            superdato-img='${assetsJuego4.superdato_img}'
            img-menu='${assetsJuego5.img_menu}'
            >
        </menu-juegos-component>
    `);
}