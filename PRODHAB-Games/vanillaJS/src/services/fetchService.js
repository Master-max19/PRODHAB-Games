

/**
 * apiFetch: Función para hacer llamadas a la API protegida
 * Maneja token, errores HTTP, y respuestas vacías o JSON.
 */
async function apiFetch(url, options = {}) {
  // Construir headers combinando los existentes con Authorization si hay token
  const headers = {
    ...(options.headers || {}),
  };

  try {

    const res = await fetch(url, { ...options, headers, credentials: "include" });
    console.log(res)
    // Manejar 401: limpiar sesión y redirigir
    if (res.status === 401) {
      sessionStorage.removeItem("sesion_admin_juegos_prodhab");
      const loginCard = document.querySelector(".fondo-login");
      let sidenav = document.querySelector("side-nav-component");
      if (sidenav) {
        sidenav.style.display = 'none';
      }

      if (loginCard) {
        loginCard.style.display = 'block';

      }
      return null;
    }

    // Leer el texto de la respuesta
    const text = await res.text();

    // Manejar errores HTTP
    if (!res.ok) {
      let errorData;
      try { errorData = JSON.parse(text); } catch (e) { errorData = null; }
      throw new Error(errorData?.message || `Error en la petición: ${res.status}`);
    }

    // Si la respuesta está vacía, retornar null
    if (!text) return null;

    // Intentar parsear JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      // Si no es JSON, retornar el texto tal cual
      return text;
    }

  } catch (err) {
    console.error("Error en apiFetch:", err);
    throw err;
  }
}
