let taskGenerator = document.getElementById("taskGeneratorContainer");
let taskNameInput = document.getElementById("taskNameInput");
let noInputMsg = document.getElementById("noInput");
let dateInput = document.getElementById("dateInput");
let taskList = document.getElementById("taskList");
let completedTaskList = document.getElementById("completedTaskList");
let taskNames = JSON.parse(localStorage.getItem("taskNames")) || [];
let dates = JSON.parse(localStorage.getItem("dates")) || [];
let completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
var actualDate = new Date();

Notification.requestPermission().then((result) => {
    console.log(result);
});

let savedTaskNames = taskNames;
let savedDates = dates;

function showTaskGenerator() {
    taskGenerator.style.display = "flex";
}

function hideTaskGenerator() {
    taskGenerator.style.display = "none";
}

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
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    return diffInDays;
}

function addTask() {
    if (taskNameInput.value && dateInput.value) {
        const daysUntil = calculateDaysUntil(dateInput.value);
        const dueDateText = daysUntil > 0 ? `faltan ${daysUntil} días` : daysUntil === 0 ? "vence hoy" : "ya pasó";
        
        taskList.innerHTML += `<p class="taskNameEl">${taskNameInput.value} (${dueDateText})</p>` +
            `<p class="dueDateEl"> due date: ${formatDate(dateInput.value)}` + 
            '<button class="taskFinishedBtn" onClick="finishTask(event)">✔</button></p> <hr>';
        
        taskNames.push(taskNameInput.value);
        dates.push(dateInput.value);
        
        localStorage.setItem("taskNames", JSON.stringify(taskNames));
        localStorage.setItem("dates", JSON.stringify(dates));
        
        taskNameInput.value = '';  
        dateInput.value = '';      
        noInputMsg.textContent = "";
        hideTaskGenerator();
    } else {
        noInputMsg.textContent = "Please complete the required inputs";
    }

    if (taskNames.length > 0) {
        document.querySelector("#noTasksMessage")?.remove();
    }
}

function finishTask(event) {
    let taskElement = event.target.parentElement;
    let taskText = taskElement.innerText.replace(" due date: ✔", "");
    let taskIndex = taskNames.indexOf(taskText.split(" due date: ")[0]);

    if (taskIndex > -1) {
        completedTasks.push({
            name: taskNames[taskIndex],
            date: dates[taskIndex]
        });

        localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
        taskNames.splice(taskIndex, 1);
        dates.splice(taskIndex, 1);

        localStorage.setItem("taskNames", JSON.stringify(taskNames));
        localStorage.setItem("dates", JSON.stringify(dates));
    }

    let nextElement = taskElement.nextElementSibling;
    if (nextElement && nextElement.tagName === "HR") {
        nextElement.remove();
    }
    taskElement.remove();

    if (taskNames.length === 0) {
        taskList.innerHTML = '<p id="noTasksMessage">No due tasks</p>';
    }
}

function checkDueDates() {
    let today = new Date();
    
    for (let i = 0; i < taskNames.length; i++) {
        let taskDate = new Date(dates[i]);
        let daysDifference = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

        if (daysDifference === 7) {
            sendNotification(taskNames[i], "7 days left until the due date");
        } else if (daysDifference === 2) {
            sendNotification(taskNames[i], "2 days left until the due date");
        } else if (daysDifference === 1) {
            sendNotification(taskNames[i], "1 day left until the due date");
        }
    }
}

function sendNotification(task, message) {
    if (Notification.permission === "granted") {
        new Notification("Task Reminder", {
            body: `${task}: ${message}`,
            icon: "url(../appIcon.png)"
        });
    }
}

function showCompletedTasks() {
    document.getElementById("containerTasks").style.display = "none";
    document.getElementById("containerHomepageBtn").style.display = "none";
    document.getElementById("taskGeneratorContainer").style.display = "none";

    document.getElementById("completedTasksContainer").style.display = "flex";
    
    completedTaskList.innerHTML = "";
    
    if (completedTasks.length > 0) {
        for (let i = 0; i < completedTasks.length; i++) {
            const daysUntil = calculateDaysUntil(completedTasks[i].date);
            const dueDateText = daysUntil > 0 ? `faltan ${daysUntil} días` : daysUntil === 0 ? "vence hoy" : "ya pasó";
            
            completedTaskList.innerHTML += `<p class="taskNameEl">${completedTasks[i].name} (${dueDateText})</p>` +
                `<p class="dueDateEl"> Due date: ${formatDate(completedTasks[i].date)}` +
                `<button class="reAddFinishedTaskBtn" onClick="reAddTask(${i})">Add to task list</button></p> <hr>`;
        }
    } else {
        completedTaskList.innerHTML = '<p>No completed tasks</p>';
    }
}

function reAddTask(index) {
    let task = completedTasks[index];
    const daysUntil = calculateDaysUntil(task.date);
    const dueDateText = daysUntil > 0 ? `faltan ${daysUntil} días` : daysUntil === 0 ? "vence hoy" : "ya pasó";

    taskList.innerHTML += `<p class="taskNameEl">${task.name} (${dueDateText})</p>` +
        `<p class="dueDateEl"> due date: ${formatDate(task.date)}` + 
        '<button class="taskFinishedBtn" onClick="finishTask(event)">✔</button></p> <hr>';

    taskNames.push(task.name);
    dates.push(task.date);

    localStorage.setItem("taskNames", JSON.stringify(taskNames));
    localStorage.setItem("dates", JSON.stringify(dates));

    completedTasks.splice(index, 1);
    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));

    showCompletedTasks();
}

function goBackToMain() {
    document.getElementById("containerTasks").style.display = "flex";
    document.getElementById("containerHomepageBtn").style.display = "block";
    
    document.getElementById("completedTasksContainer").style.display = "none";
}

document.getElementById("previousTasksBtn").addEventListener("click", showCompletedTasks);

function getSavedTasks() {
    if (savedTaskNames.length > 0) {
        taskList.innerHTML = "";
        for (let i = 0; i < savedTaskNames.length; i++) {
            const daysUntil = calculateDaysUntil(savedDates[i]);
            const dueDateText = daysUntil > 0 ? `faltan ${daysUntil} días` : daysUntil === 0 ? "vence hoy" : "ya pasó";

            taskList.innerHTML += `<p class="taskNameEl">${savedTaskNames[i]} (${dueDateText})</p>` +
                `<p class="dueDateEl"> due date: ${formatDate(savedDates[i])}` +
                '<button class="taskFinishedBtn" onClick="finishTask(event)">✔</button></p> <hr>';
        }
    } else {
        taskList.innerHTML = '<p id="noTasksMessage">No due tasks</p>';
    }
}

setInterval(checkDueDates, 43200000); // 12 horas

getSavedTasks();


