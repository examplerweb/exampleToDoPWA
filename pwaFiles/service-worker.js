const cacheName = 'v1';

const filesToCache = [
  '',  // Asegúrate de que la raíz esté correctamente configurada
  'index.html',
  'style.css',
  'pwaFiles/service-worker.js',   // Asegúrate de que los archivos estén en la ruta correcta
  'pwaFiles/functionsIndexedDB.js',
  'pwaFiles/manifest.json'
];

// Instalar el service worker y cachear los archivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => {
        return Promise.all(
          filesToCache.map((file) => {
            return fetch(file)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Error al obtener el archivo: ${file}`);
                }
                return cache.put(file, response);
              })
              .catch((error) => {
                console.error(`Error al cachear el archivo ${file}:`, error);
              });
          })
        );
      })
      .catch((error) => {
        console.error('Error al intentar hacer cache de los archivos:', error);
      })
  );
});

// Activar el service worker y limpiar los cachés antiguos (opcional)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cacheName]; // Mantener solo la versión actual del caché
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!cacheWhitelist.includes(cache)) {
            console.log(`Borrando caché obsoleto: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Recuperar archivos desde el cache (si está disponible)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Si el recurso está en cache, se devuelve
        if (cachedResponse) {
          console.log(`Recurso desde cache: ${event.request.url}`);
          return cachedResponse;
        }
        
        // Si no está en cache, se hace una solicitud de red
        return fetch(event.request)
          .then((response) => {
            // Solo cacheamos las respuestas exitosas (por ejemplo, no cachear errores 404)
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(cacheName)
                .then((cache) => {
                  cache.put(event.request, responseClone);  // Cachear la nueva respuesta
                })
                .catch((error) => {
                  console.error('Error al guardar en el cache:', error);
                });
            }
            return response;
          })
          .catch((error) => {
            console.error('Error al hacer la solicitud a la red:', error);
            // Opcional: Puedes devolver una página de error en caso de fallo de red
            return caches.match('/offline.html'); // Asegúrate de que offline.html esté cacheado
          });
      })
  );
});


// Escuchar el evento de notificación push
self.addEventListener('push', function(event) {
    let options = {
      body: event.data.text(), // Cuerpo del mensaje
      icon: 'pwaFiles/icon.png', // Icono para la notificación
      badge: 'pwaFiles/badge.png', // Icono de notificación (opcional)
    };
  
    // Mostrar la notificación
    event.waitUntil(
      self.registration.showNotification('Nueva notificación', options)
    );
  });
  
  // Acciones al hacer clic en la notificación
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    // Aquí puedes redirigir al usuario a una URL, por ejemplo:
    event.waitUntil(
      clients.openWindow('/') // Redirige a la página principal
    );
  });

  
  self.addEventListener('push', function(event) {
    const options = {
      body: event.data.text(),  // El contenido de la notificación (puedes personalizarlo)
      icon: 'pwaFiles/icon.png',  // El ícono de la notificación
      badge: 'pwaFiles/badge.png'  // El badge de la notificación (opcional)
    };
  
    event.waitUntil(
      self.registration.showNotification('Notificación Push', options)  // Mostrar la notificación
    );
  });
  