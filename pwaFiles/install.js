// Comprobar si el navegador soporta Service Workers y notificaciones
if ('serviceWorker' in navigator && 'PushManager' in window) {
    // Registrar el Service Worker
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./pwaFiles/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch((error) => {
                console.error('Error al registrar el Service Worker:', error);
            });
    });

    // Verificar si el usuario tiene permiso para recibir notificaciones
    Notification.requestPermission().then((permission) => {
        console.log(permission === 'granted' 
            ? 'Permiso para notificaciones push concedido.' 
            : 'Permiso para notificaciones push denegado.');
    });
}

// Inicializamos la variable que almacenará el evento de instalación
let deferredPrompt;

// Evento para mostrar el popup de instalación
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log("Evento beforeinstallprompt disparado");

    deferredPrompt = e;

    const installPopup = document.getElementById('install-popup');
    if (installPopup) installPopup.style.display = 'block';

    const installBtn = document.getElementById('install-button');
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();

            deferredPrompt.userChoice.then((choiceResult) => {
                console.log(choiceResult.outcome === 'accepted' 
                    ? 'El usuario ha aceptado la instalación' 
                    : 'El usuario ha rechazado la instalación');

                if (installPopup) installPopup.style.display = 'none';
                deferredPrompt = null;
            });
        });
    }
});

// Evento para manejar si la PWA ya está instalada
window.addEventListener('appinstalled', () => {
    console.log('La aplicación ha sido instalada');

    const installPopup = document.getElementById('install-popup');
    if (installPopup) installPopup.style.display = 'none';
});
