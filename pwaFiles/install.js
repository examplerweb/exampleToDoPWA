




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
      if (permission === 'granted') {
        console.log('Permiso para notificaciones push concedido.');
      } else {
        console.log('Permiso para notificaciones push denegado.');
      }
    });
  
    // Agregar evento para el botón de prueba de notificación push
    const pushBtn = document.getElementById('push-notification-btn');
    pushBtn.addEventListener('click', () => {
      // Verificar si la API de notificaciones está disponible
      if (Notification.permission === 'granted') {
        // Crear una notificación push
        if (navigator.serviceWorker) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('¡Notificación Push!', {
              body: 'Esta es una prueba de notificación push.',
              icon: 'pwaFiles/icon.png',  // Agregar un ícono para la notificación
              badge: 'pwaFiles/badge.png'  // Agregar un ícono de badge (opcional)
            });
          });
        }
      } else {
        alert('Por favor, permite las notificaciones para recibirlas.');
      }
    });
  }
  

  
// Inicializamos la variable que almacenará el evento de instalación
let deferredPrompt;

// Evento para mostrar el popup de instalación
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir que el navegador muestre el prompt de instalación por defecto
    e.preventDefault();
    console.log("Evento beforeinstallprompt disparado");

    // Guardamos el evento para mostrarlo más tarde
    deferredPrompt = e;

    // Mostrar el popup de instalación
    const installPopup = document.getElementById('install-popup');
    installPopup.style.display = 'block';  // Muestra el popup cambiando display a 'block'

    // Obtener el botón de instalación
    const installBtn = document.getElementById('install-button');
  
    // Cuando el usuario haga clic en el botón de instalación
    installBtn.addEventListener('click', () => {
        // Mostrar el prompt de instalación
        deferredPrompt.prompt();

        // Esperar la respuesta del usuario (aceptó o rechazó)
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('El usuario ha aceptado la instalación');
            } else {
                console.log('El usuario ha rechazado la instalación');
            }
            // Ocultamos el popup después de la interacción
            installPopup.style.display = 'none';
            deferredPrompt = null;  // Limpiamos el evento de instalación
        });
    });
});

// Evento para manejar si la PWA ya está instalada
window.addEventListener('appinstalled', () => {
    console.log('La aplicación ha sido instalada');
    // Si la app ya está instalada, ocultamos el popup
    const installPopup = document.getElementById('install-popup');
    installPopup.style.display = 'none';
});

