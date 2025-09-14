const API_BASE = "https://localhost:7006/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "include",            // <-- clave: envía/recibe cookies
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  // intenta parsear error legible
  if (!res.ok) {
    let msg = "Error en la petición";
    try { msg = (await res.json()).message || msg; } catch {}
    throw new Error(msg);
  }
  // algunas respuestas no traen json
  try { return await res.json(); } catch { return null; }
}

// --------- Auth
export async function register(email, password, rolId = 2) { // por defecto "usuario"
  return apiFetch("/Auth/register", { method: "POST", body: { correo: email, password, rolId } });
}

export async function login(email, password) {
  return apiFetch("/Auth/login", { method: "POST", body: { username: email, password } });
}

export async function logout() {
  return apiFetch("/Auth/logout", { method: "POST" });
}

export async function getJuegos() {
  return apiFetch("/Juegos");
}

export async function getAdminData() {
  return apiFetch("/Admin");
}

