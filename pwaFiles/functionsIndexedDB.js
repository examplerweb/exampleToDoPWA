// Declaración de la base de datos y la tienda de tareas
const dbName = "exampleTaskDB4";  // Nombre de la base de datos
const storeName = "tasks";        // Nombre de la tienda de tareas
let db;                           // Variable para almacenar la referencia a la base de datos

// Función para abrir la base de datos
function openDB() {
  // Abrir la base de datos con una versión 2
  const request = indexedDB.open(dbName, 2); 

  // Este evento ocurre cuando necesitamos actualizar la base de datos (si cambia la estructura)
  request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Si no existe la tienda 'tasks', la creamos
    if (!db.objectStoreNames.contains(storeName)) {
      const store = db.createObjectStore(storeName, { keyPath: 'ID' });  // 'ID' es la clave primaria
      store.createIndex("ID", "ID", { unique: true });  // Crear índice único para 'ID'
    }
  };

  // Este evento ocurre cuando la base de datos se abre con éxito
  request.onsuccess = function(event) {
    db = event.target.result;
    loadTasks();  // Cargar las tareas desde la base de datos
  };

  // Este evento ocurre si hay un error al abrir la base de datos
  request.onerror = function(error) {
    console.error("Error al abrir la base de datos:", error);
  };
}

// Función para cargar todas las tareas desde la base de datos
function loadTasks() {
  const transaction = db.transaction([storeName], "readonly"); // Leer datos de la base de datos
  const store = transaction.objectStore(storeName);
  const request = store.getAll();  // Obtener todas las tareas

  // Si la solicitud tiene éxito, mostramos las tareas en la interfaz
  request.onsuccess = function(event) {
    const tasks = event.target.result;
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";  // Limpiar la lista de tareas antes de agregar nuevas

    tasks.forEach(task => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-item";  // Asignamos una clase para los elementos de tarea
      taskElement.innerHTML = `
        ${task.text} 
        <button class="delete-btn" data-id="${task.ID}">❌</button>  <!-- Botón de eliminar -->
      `;
      taskList.appendChild(taskElement);  // Agregar la tarea a la lista

      // Añadir el evento de eliminar a cada botón
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteTask);
      });
    });
  };

  // Si ocurre un error al cargar las tareas
  request.onerror = function(error) {
    console.error("Error al cargar las tareas:", error);
  };
}

// Función para agregar una nueva tarea
document.getElementById("add-task-btn").onclick = function () {
  const taskInput = document.getElementById("task-input");

  // Validamos que el campo de entrada no esté vacío
  if (taskInput.value.trim() !== "") {
    const transaction = db.transaction([storeName], "readwrite");  // Abrimos una transacción de lectura y escritura
    const store = transaction.objectStore(storeName);

    const taskId = Date.now();  // Usamos el tiempo actual como ID único
    const task = { 
      text: taskInput.value.trim(),
      ID: taskId  // Asignamos el ID a la tarea
    };

    const request = store.add(task);  // Añadimos la tarea a la base de datos

    // Si la tarea se añade correctamente, recargamos las tareas y limpiamos el campo de entrada
    request.onsuccess = function (event) {
      loadTasks();  // Recargar las tareas
      taskInput.value = "";  // Limpiar el campo de entrada
    };

    // Si ocurre un error al agregar la tarea
    request.onerror = function (error) {
      console.error("Error al agregar tarea:", error);
    };
  }
};

// Función para eliminar una tarea
function deleteTask(event) {
  const taskId = parseInt(event.target.getAttribute("data-id"));  // Obtener el ID de la tarea desde el botón

  if (taskId) {
    const transaction = db.transaction([storeName], "readwrite");  // Abrir transacción de lectura y escritura
    const store = transaction.objectStore(storeName);

    // Eliminar la tarea usando el ID
    const deleteRequest = store.delete(taskId);

    // Si la eliminación es exitosa, recargamos la lista de tareas
    deleteRequest.onsuccess = function () {
      console.log(`Tarea eliminada con ID: ${taskId}`);
      loadTasks();  // Recargar las tareas
    };

    // Si ocurre un error al eliminar la tarea
    deleteRequest.onerror = function (error) {
      console.error("Error al eliminar la tarea:", error);
    };
  } else {
    console.error("taskId no es válido");
  }
}

// Inicializar la base de datos al cargar la página
openDB();
