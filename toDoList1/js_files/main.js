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

function addTask() {
    if (taskNameInput.value && dateInput.value) {
        taskList.innerHTML += '<p>' + taskNameInput.value + " due date: " + dateInput.value + 
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
            completedTaskList.innerHTML += '<p>' + completedTasks[i].name + ' Due date: '+completedTasks[i].date+'<button class="reAddFinishedTaskBtn" onClick="reAddTask('+i+')">Add to task list</button></p> <hr>';
        }
    } else {
        completedTaskList.innerHTML = '<p>No completed tasks</p>';
    }
}

function reAddTask(index) {
    let task = completedTasks[index];
    taskList.innerHTML += '<p>' + task.name + " due date: " + task.date + 
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
            taskList.innerHTML += '<p>' + savedTaskNames[i] + " due date: " + savedDates[i] + 
                '<button class="taskFinishedBtn" onClick="finishTask(event)">✔</button></p> <hr>';
        }
    } else {
        taskList.innerHTML = '<p id="noTasksMessage">No due tasks</p>';
    }
}

setInterval(checkDueDates, 43200000 ); //12hs

getSavedTasks();

