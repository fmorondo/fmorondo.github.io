// auth-check.js
(function() {
    // Función para obtener una cookie por nombre
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Comprobar si existe la cookie 'session_token'
    if (getCookie('session_token') !== 'authenticated_user') {
        // Si no existe, redirigir al login
        window.location.href = 'login.html';
    }
})();