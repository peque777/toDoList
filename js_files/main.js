// Variables y referencias
let taskGenerator = document.getElementById("taskGeneratorContainer");
let taskNameInput = document.getElementById("taskNameInput");
let noInputMsg = document.getElementById("noInput");
let dateInput = document.getElementById("dateInput");
let taskList = document.getElementById("taskList");
let completedTaskList = document.getElementById("completedTaskList");
let taskNames = JSON.parse(localStorage.getItem("taskNames")) || [];
let dates = JSON.parse(localStorage.getItem("dates")) || [];
let completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
let pinnedTasks = JSON.parse(localStorage.getItem("pinnedTasks")) || [];
Notification.requestPermission();

// Mostrar/Ocultar generador de tareas
function showTaskGenerator() {
    taskGenerator.style.display = "flex";
}

function hideTaskGenerator() {
    taskGenerator.style.display = "none";
}

// Formatear y calcular fechas
function formatDate(dateString) {
    let date = new Date(dateString);
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

function calculateDaysUntil(dateString) {
    const inputDate = new Date(dateString); 
    const today = new Date(); 
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffInMs = inputDate - today;
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

// Añadir tareas
function addTask() {
    if (taskNameInput.value && dateInput.value) {
        taskNames.push(taskNameInput.value);
        dates.push(dateInput.value);
        localStorage.setItem("taskNames", JSON.stringify(taskNames));
        localStorage.setItem("dates", JSON.stringify(dates));
        taskNameInput.value = '';
        dateInput.value = '';
        noInputMsg.textContent = "";
        hideTaskGenerator();
        displayTasks();
    } else {
        noInputMsg.textContent = "Please complete the required inputs";
    }
}

// Mostrar tareas
function displayTasks() {
    sortTasks();
    taskList.innerHTML = "";

    // Mostrar tareas "pinneadas" primero
    pinnedTasks.forEach((task) => {
        const daysUntil = calculateDaysUntil(task.date);
        const dueDateText = daysUntil > 0 ? `faltan ${daysUntil} días` : daysUntil === 0 ? "vence hoy" : "ya pasó";
        taskList.innerHTML += `
            <div class="taskItem pinned">
                <p class="taskNameEl">📌${task.name} (${dueDateText})</p>
                <p class="dueDateEl">Due date: ${formatDate(task.date)}</p>
                <button class="taskFinishedBtn" onClick="finishTask('${task.name}', true)">✔</button>
                <button class="pinTaskBtn" onClick="togglePinTask('${task.name}', '${task.date}')">📌</button>
                <button class="deleteTaskBtn" onClick="deleteTask('${task.name}', true)">🗑</button>
            </div>
            <hr>`;
    });

    // Mostrar tareas normales
    taskNames.forEach((task, i) => {
        if (!pinnedTasks.some(pinned => pinned.name === task)) { // Solo muestra las tareas no "pinneadas"
            const daysUntil = calculateDaysUntil(dates[i]);
            const dueDateText = daysUntil > 0 ? `faltan ${daysUntil} días` : daysUntil === 0 ? "vence hoy" : "ya pasó";
            taskList.innerHTML += `
                <div class="taskItem">
                    <p class="taskNameEl">${task} (${dueDateText})</p>
                    <p class="dueDateEl">Due date: ${formatDate(dates[i])}</p>
                    <button class="taskFinishedBtn" onClick="finishTask('${task}', false)">✔</button>
                    <button class="pinTaskBtn" onClick="togglePinTask('${task}', '${dates[i]}')">📌</button>
                    <button class="deleteTaskBtn" onClick="deleteTask('${task}', false)">🗑</button>
                </div>
                <hr>`;
        }
    });

    if (taskNames.length === 0 && pinnedTasks.length === 0) {
        taskList.innerHTML = '<p id="noTasksMessage">No due tasks</p>';
    }
}

// Ordenar tareas
function sortTasks() {
    // Ordenar tareas normales
    let taskDetails = taskNames.map((name, i) => ({
        name,
        date: dates[i],
        daysUntil: calculateDaysUntil(dates[i])
    }));
    taskDetails.sort((a, b) => a.daysUntil - b.daysUntil);
    taskNames = taskDetails.map(task => task.name);
    dates = taskDetails.map(task => task.date);

    // Ordenar tareas "pinneadas" también
    pinnedTasks.sort((a, b) => calculateDaysUntil(a.date) - calculateDaysUntil(b.date));

    localStorage.setItem("taskNames", JSON.stringify(taskNames));
    localStorage.setItem("dates", JSON.stringify(dates));
    localStorage.setItem("pinnedTasks", JSON.stringify(pinnedTasks));
}

// Marcar tarea como finalizada
function finishTask(taskName, isPinned) {
    if (isPinned) {
        let pinnedIndex = pinnedTasks.findIndex(task => task.name === taskName);
        if (pinnedIndex > -1) {
            completedTasks.push(pinnedTasks[pinnedIndex]);
            pinnedTasks.splice(pinnedIndex, 1);
            localStorage.setItem("pinnedTasks", JSON.stringify(pinnedTasks));
        }
    } else {
        let taskIndex = taskNames.indexOf(taskName);
        if (taskIndex > -1) {
            completedTasks.push({ name: taskNames[taskIndex], date: dates[taskIndex] });
            taskNames.splice(taskIndex, 1);
            dates.splice(taskIndex, 1);
            localStorage.setItem("taskNames", JSON.stringify(taskNames));
            localStorage.setItem("dates", JSON.stringify(dates));
        }
    }
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    displayTasks();
}

// Función para eliminar la tarea
function deleteTask(taskName, isPinned) {
    if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
        if (isPinned) {
            // Eliminar de tareas pinneadas
            let pinnedIndex = pinnedTasks.findIndex(task => task.name === taskName);
            if (pinnedIndex > -1) {
                pinnedTasks.splice(pinnedIndex, 1);
                localStorage.setItem("pinnedTasks", JSON.stringify(pinnedTasks));
            }
        } else {
            // Eliminar de tareas normales
            let taskIndex = taskNames.indexOf(taskName);
            if (taskIndex > -1) {
                taskNames.splice(taskIndex, 1);
                dates.splice(taskIndex, 1);
                localStorage.setItem("taskNames", JSON.stringify(taskNames));
                localStorage.setItem("dates", JSON.stringify(dates));
            }
        }
        displayTasks();
    }
}

// Función para alternar "pin" en una tarea
function togglePinTask(taskName, taskDate) {
    const taskIndex = taskNames.indexOf(taskName);

    if (taskIndex > -1) {
        // Si la tarea está en la lista normal, la eliminamos y la añadimos a las "pinneadas"
        pinnedTasks.push({ name: taskName, date: taskDate });
        taskNames.splice(taskIndex, 1); // Eliminar de tareas normales
        dates.splice(taskIndex, 1); // También eliminar la fecha correspondiente
    } else {
        // Si la tarea está en la lista "pinneada", la eliminamos
        const pinnedIndex = pinnedTasks.findIndex(task => task.name === taskName);
        if (pinnedIndex > -1) {
            pinnedTasks.splice(pinnedIndex, 1); // Eliminar de tareas "pinneadas"
        }
    }
    
    // Guardar cambios en local storage
    localStorage.setItem("taskNames", JSON.stringify(taskNames));
    localStorage.setItem("dates", JSON.stringify(dates));
    localStorage.setItem("pinnedTasks", JSON.stringify(pinnedTasks));
    
    displayTasks();
}


// Funciones para tareas completadas
function reAddTask(index) {
    let task = completedTasks[index];
    taskNames.push(task.name);
    dates.push(task.date);
    localStorage.setItem("taskNames", JSON.stringify(taskNames));
    localStorage.setItem("dates", JSON.stringify(dates));
    completedTasks.splice(index, 1);
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
    showCompletedTasks();
    displayTasks();
}

// Comprobar fechas de vencimiento
function checkDueDates() {
    let today = new Date();
    for (let i = 0; i < taskNames.length; i++) {
        let taskDate = new Date(dates[i]);
        let daysDifference = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
        if ([7, 2, 1].includes(daysDifference)) {
            sendNotification(taskNames[i], `${daysDifference} days left until the due date`);
        }
    }
}

// Enviar notificación
function sendNotification(task, message) {
    if (Notification.permission === "granted") {
        new Notification("Task Reminder", { body: `${task}: ${message}`, icon: "url(../appIcon.png)" });
    }
}

// Mostrar tareas completadas
function showCompletedTasks() {
    document.getElementById("containerTasks").style.display = "none";
    document.getElementById("containerHomepageBtn").style.display = "none";
    document.getElementById("taskGeneratorContainer").style.display = "none";
    document.getElementById("completedTasksContainer").style.display = "flex";
    completedTaskList.innerHTML = "";
    if (completedTasks.length > 0) {
        completedTasks.forEach((task, i) => {
            const daysUntil = calculateDaysUntil(task.date);
            const dueDateText = daysUntil > 0 ? `faltan ${daysUntil} días` : daysUntil === 0 ? "vence hoy" : "ya pasó";
            completedTaskList.innerHTML += `
                <div class="completedTaskItem">
                    <p class="taskNameEl">${task.name} (${dueDateText})</p>
                    <p class="dueDateEl">Due date: ${formatDate(task.date)}</p>
                    <button class="reAddFinishedTaskBtn" onClick="reAddTask(${i})">Add to task list</button>
                </div>
                <hr>`;
        });
    } else {
        completedTaskList.innerHTML = '<p>No completed tasks</p>';
    }
}

// Volver a la vista principal
function goBackToMain() {
    document.getElementById("containerTasks").style.display = "flex";
    document.getElementById("containerHomepageBtn").style.display = "block";
    document.getElementById("completedTasksContainer").style.display = "none";
}

// Escuchar evento para mostrar tareas completadas
document.getElementById("previousTasksBtn").addEventListener("click", showCompletedTasks);

// Obtener tareas guardadas al inicio
function getSavedTasks() {
    displayTasks();
}

// Intervalo para comprobar fechas de vencimiento
setInterval(checkDueDates, 43200000); // 12 horas

getSavedTasks();






