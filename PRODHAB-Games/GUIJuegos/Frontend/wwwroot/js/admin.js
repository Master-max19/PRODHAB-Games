import { getAdminData } from "./auth-service.js";

const out = document.getElementById("adminOut");
const show = (v) => out.textContent = typeof v === "string" ? v : JSON.stringify(v, null, 2);

(async () => {
  try {
    const data = await getAdminData();
    show(data);
  } catch (err) {
    alert("Acceso denegado o sesión expirada");
    window.location.href = "/Login";
  }
})();