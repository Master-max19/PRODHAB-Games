/**
 * apiFetch: Función para hacer llamadas a la API protegida
 * Envía token si existe y maneja redirección si no autorizado (401)
 */
async function apiFetch(url, options = {}) {
    // Obtener token del localStorage

    // Construir headers combinando los existentes con Authorization si hay token
    const headers = {
        ...(options.headers || {}),
    };

    try {
        // Hacer fetch con headers y options
        const res = await fetch(url, { ...options, headers, credentials: "include" });

        // Manejar respuesta 401: limpiar sesión y redirigir al login
        if (res.status === 401) {
            sessionStorage.removeItem("sesion_admin_juegos_prodhab");
            window.location.href = CONFIG.routes.login;
            return null;
        }

        // Manejar otros errores HTTP
        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.message || `Error en la petición: ${res.status}`);
        }

        // Retornar JSON
        return await res.json();
    } catch (err) {
        console.error("Error en apiFetch:", err);
        throw err;
    }
}
