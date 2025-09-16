import { register, login, logout, getJuegos } from "./auth-service.js";

const out = document.getElementById("out");
const show = (v) => out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2);
const loginMsg = document.getElementById("login-msg");


function showLoginMessage(v) {
  loginMsg.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2);
}

/*document.getElementById("btn-register").onclick = async () => {
  try {
    const correo = document.getElementById("reg-email").value;
    const pass = document.getElementById("reg-pass").value;
    const rolId = parseInt(document.getElementById("reg-rol").value, 10);
    const r = await register(correo, pass, rolId);
    show(r || "Usuario creado");
  } catch (e) {
    show(e.message);
  }
};
*/
document.getElementById("btn-login").onclick = async () => {
  try {
    const correo = document.getElementById("log-email").value;
    const pass = document.getElementById("log-pass").value;
    await login(correo, pass);
    window.location.href = "/Admin";
  } catch (e) {
    showLoginMessage(e.message); // ahora pinta en la tarjeta de login
  }
};

document.getElementById("btn-logout").onclick = async () => {
  try {
    show(await logout() || "Logout ok");
  } catch (e) {
    show(e.message);
  }
};

/*document.getElementById("btn-juegos").onclick = async () => {
  try {
    show(await getJuegos());
  } catch (e) {
    show(e.message);
  }
};
*/
