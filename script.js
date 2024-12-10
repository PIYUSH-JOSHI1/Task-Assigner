// DOM Elements
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskModal = document.getElementById('add-task-modal');
const addTaskForm = document.getElementById('add-task-form');
const closeModalBtn = document.getElementById('close-modal');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-tasks');
const sortSelect = document.getElementById('sort-tasks');
const taskDetailsContent = document.getElementById('task-details-content');
const exportTasksBtn = document.getElementById('export-tasks');
const importTasksBtn = document.getElementById('import-tasks');
const importFileInput = document.getElementById('import-file');
const userAvatar = document.getElementById('user-avatar');
const avatarUpload = document.getElementById('avatar-upload');

// Task array to store tasks
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to save tasks to localStorage
function saveTasks() {
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to render tasks
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.style.borderLeftColor = getCategoryColor(task.category);
        li.innerHTML = `
            <span>${task.title}</span>
            <div>
                <button onclick="toggleTaskCompletion(${index})" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    ${task.completed ? '✓' : '○'}
                </button>
                <button onclick="showTaskDetails(${index})" aria-label="Show task details">
                    <i class="fas fa-info-circle"></i>
                </button>
                <button onclick="deleteTask(${index})" aria-label="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
    updateDashboard();
}

// Function to add a new task
function addTask(event) {
    event.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const datetime = document.getElementById('task-datetime').value;
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const recurrence = document.getElementById('task-recurrence').value;

    const newTask = {
        title,
        description,
        datetime,
        category,
        priority,
        recurrence,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    addTaskModal.style.display = 'none';
    addTaskForm.reset();
    scheduleNotification(newTask);
}

// Function to toggle task completion
function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// Function to delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Function to show task details
function showTaskDetails(index) {
    const task = tasks[index];
    taskDetailsContent.innerHTML = `
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <p>Due: ${new Date(task.datetime).toLocaleString()}</p>
        <p>Category: ${task.category}</p>
        <p>Priority: ${task.priority}</p>
        <p>Recurrence: ${task.recurrence}</p>
        <p>Status: ${task.completed ? 'Completed' : 'Pending'}</p>
    `;
}

// Function to schedule notification
function scheduleNotification(task) {
    const now = new Date().getTime();
    const taskTime = new Date(task.datetime).getTime();
    const timeUntilTask = taskTime - now;

    if (timeUntilTask > 0) {
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification('Task Reminder', {
                    body: `Your task "${task.title}" is due now!`,
                });
            }
        }, timeUntilTask);
    }
}

// Function to toggle dark theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDarkTheme = document.body.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDarkTheme);
    themeToggle.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// Function to filter tasks
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm)
    );
    renderFilteredTasks(filteredTasks);
}

// Function to sort tasks
function sortTasks() {
    const sortBy = sortSelect.value;
    tasks.sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(a.datetime) - new Date(b.datetime);
        } else if (sortBy === 'priority') {
            const priorityOrder = { low: 0, medium: 1, high: 2 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        } else if (sortBy === 'category') {
            return a.category.localeCompare(b.category);
        }
    });
    renderTasks();
}

// Function to render filtered tasks
function renderFilteredTasks(filteredTasks) {
    taskList.innerHTML = '';
    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.style.borderLeftColor = getCategoryColor(task.category);
        li.innerHTML = `
            <span>${task.title}</span>
            <div>
                <button onclick="toggleTaskCompletion(${index})" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    ${task.completed ? '✓' : '○'}
                </button>
                <button onclick="showTaskDetails(${index})" aria-label="Show task details">
                    <i class="fas fa-info-circle"></i>
                </button>
                <button onclick="deleteTask(${index})" aria-label="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Function to get category color
function getCategoryColor(category) {
    const colors = {
        personal: '#3498db',
        work: '#e74c3c',
        health: '#2ecc71',
        education: '#f39c12',
        finance: '#9b59b6'
    };
    return colors[category] || '#95a5a6';
}

// Function to export tasks
function exportTasks() {
    const tasksString = JSON.stringify(tasks);
    const blob = new Blob([tasksString], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tasks.txt';
    a.click();
}

// Function to import tasks
function importTasks(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedTasks = JSON.parse(e.target.result);
                tasks = importedTasks;
                saveTasks();
                renderTasks();
                alert('Tasks imported successfully!');
            } catch (error) {
                alert('Error importing tasks. Please make sure the file is valid JSON.');
            }
        };
        reader.readAsText(file);
    }
}

// Function to update dashboard
function updateDashboard() {
    const dashboardContainer = document.querySelector('.dashboard-container');
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    dashboardContainer.innerHTML = `
        <h2>Task Dashboard</h2>
        <div class="dashboard-stats">
            <div class="stat-item">
                <h3>Total Tasks</h3>
                <p>${totalTasks}</p>
            </div>
            <div class="stat-item">
                <h3>Completed</h3>
                <p>${completedTasks}</p>
            </div>
            <div class="stat-item">
                <h3>Pending</h3>
                <p>${pendingTasks}</p>
            </div>
        </div>
    `;
}

// Function to handle recurring tasks
function handleRecurringTasks() {
    const today = new Date();
    tasks.forEach(task => {
        if (task.recurrence !== 'none' && new Date(task.datetime) <= today) {
            let newDate = new Date(task.datetime);
            switch (task.recurrence) {
                case 'daily':
                    newDate.setDate(newDate.getDate() + 1);
                    break;
                case 'weekly':
                    newDate.setDate(newDate.getDate() + 7);
                    break;
                case 'monthly':
                    newDate.setMonth(newDate.getMonth() + 1);
                    break;
                case 'yearly':
                    newDate.setFullYear(newDate.getFullYear() + 1);
                    break;
            }
            task.datetime = newDate.toISOString().slice(0, 16);
        }
    });
    saveTasks();
    renderTasks();
}

// Event Listeners
addTaskBtn.addEventListener('click', () => addTaskModal.style.display = 'block');
closeModalBtn.addEventListener('click', () => addTaskModal.style.display = 'none');
addTaskForm.addEventListener('submit', addTask);
themeToggle.addEventListener('click', toggleTheme);
searchInput.addEventListener('input', filterTasks);
sortSelect.addEventListener('change', sortTasks);
exportTasksBtn.addEventListener('click', exportTasks);
importTasksBtn.addEventListener('click', () => importFileInput.click());
importFileInput.addEventListener('change', importTasks);
userAvatar.addEventListener('click', () => avatarUpload.click());
avatarUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            userAvatar.src = e.target.result;
            localStorage.setItem('userAvatar', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Initialize the app
function initApp() {
    renderTasks();
    updateDashboard();

    // Set initial theme
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Load saved avatar
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
        userAvatar.src = savedAvatar;
    }

    // Request notification permission
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Handle recurring tasks
    handleRecurringTasks();
    setInterval(handleRecurringTasks, 60000); // Check every minute
}

// Run the app
initApp();

// ... (previous code remains unchanged)

// Function to schedule notification
function scheduleNotification(task) {
  const now = new Date().getTime();
  const taskTime = new Date(task.datetime).getTime();
  const timeUntilTask = taskTime - now;

  if (timeUntilTask > 0) {
      setTimeout(() => {
          showNotification(task);
      }, timeUntilTask);
  }
}

// Function to show notification
function showNotification(task) {
  if (Notification.permission === 'granted') {
      const notification = new Notification('Task Reminder', {
          body: `Your task "${task.title}" is due now!`,
          icon: '/path/to/your/icon.png' // Replace with your actual icon path
      });

      notification.onclick = function() {
          window.focus();
          showTaskDetails(tasks.findIndex(t => t.title === task.title));
          this.close();
      };

      // Show alert in case notifications are blocked
      alert(`Task Reminder: ${task.title} is due now!`);
  } else {
      alert(`Task Reminder: ${task.title} is due now!`);
  }
}

// Function to add a new task
function addTask(event) {
  event.preventDefault();
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const datetime = document.getElementById('task-datetime').value;
  const category = document.getElementById('task-category').value;
  const priority = document.getElementById('task-priority').value;
  const recurrence = document.getElementById('task-recurrence').value;

  const newTask = {
      title,
      description,
      datetime,
      category,
      priority,
      recurrence,
      completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  addTaskModal.style.display = 'none';
  addTaskForm.reset();
  scheduleNotification(newTask);
}

// Function to check for due tasks
function checkDueTasks() {
  const now = new Date();
  tasks.forEach(task => {
      const taskTime = new Date(task.datetime);
      if (!task.completed && taskTime <= now) {
          showNotification(task);
      }
  });
}

// Initialize the app
function initApp() {
  renderTasks();
  updateDashboard();

  // Set initial theme
  const savedTheme = localStorage.getItem('darkTheme');
  if (savedTheme === 'true') {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Load saved avatar
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
      userAvatar.src = savedAvatar;
  }

  // Request notification permission
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
          if (permission === 'granted') {
              console.log('Notification permission granted.');
          } else {
              console.log('Notification permission denied.');
          }
      });
  }

  // Handle recurring tasks and check for due tasks
  handleRecurringTasks();
  checkDueTasks();
  setInterval(() => {
      handleRecurringTasks();
      checkDueTasks();
  }, 60000); // Check every minute

  // Schedule notifications for existing tasks
  tasks.forEach(task => {
      if (!task.completed) {
          scheduleNotification(task);
      }
  });
}

// ... (rest of the code remains unchanged)

// Run the app
initApp();