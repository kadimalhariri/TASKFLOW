class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

 
    init() {
        this.taskInput = document.getElementById('taskInput');
        this.taskDate = document.getElementById('taskDate');
        this.taskPriority = document.getElementById('taskPriority');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        

        this.totalTasksEl = document.getElementById('totalTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        this.pendingTasksEl = document.getElementById('pendingTasks');
        const today = new Date().toISOString().split('T')[0];
        this.taskDate.value = today;

        this.addTaskBtn.addEventListener('click', () => this.addTask());

        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterTasks(e));
        });


        this.renderTasks();
        this.updateStats();
        this.initNavigation();
        this.initContactForm();
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.updateStats();
    }

    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (!taskText) {
            this.showAlert('Please enter a task!', 'error');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            date: this.taskDate.value,
            priority: this.taskPriority.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.showAlert('Task added successfully!', 'success');
        this.taskInput.value = '';
        this.taskInput.focus();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.showAlert('Task deleted!', 'info');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    filterTasks(event) {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    
        this.currentFilter = event.target.dataset.filter;
        this.renderTasks();
    }

    renderTasks() {
        let filteredTasks = this.tasks;

        if (this.currentFilter === 'pending') {
            filteredTasks = this.tasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filteredTasks = this.tasks.filter(task => task.completed);
        }

        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            const priorityWeight = { high: 3, medium: 2, low: 1 };
            return priorityWeight[b.priority] - priorityWeight[a.priority] || 
                   new Date(a.date) - new Date(b.date);
        });

        this.taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        
        this.attachTaskListeners();
    }

    createTaskHTML(task) {
        const priorityClass = `priority-${task.priority}`;
        const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <span class="task-text">${this.escapeHTML(task.text)}</span>
                    <div class="task-meta">
                        <span class="task-priority-badge ${priorityClass}">${priorityLabel}</span>
                        <span class="task-date-badge">
                            <i class="far fa-calendar-alt"></i> ${this.formatDate(task.date)}
                        </span>
                    </div>
                </div>
                <button class="delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    attachTaskListeners() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.taskId);
                this.toggleTask(taskId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskItem = e.target.closest('.task-item');
                const taskId = parseInt(taskItem.dataset.taskId);
                this.deleteTask(taskId);
            });
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        if (this.totalTasksEl) this.totalTasksEl.textContent = total;
        if (this.completedTasksEl) this.completedTasksEl.textContent = completed;
        if (this.pendingTasksEl) this.pendingTasksEl.textContent = pending;
    }

    showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        document.body.appendChild(alert);

        setTimeout(() => {
            alert.remove();
        }, 3000);
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const message = document.getElementById('message').value;
   
                this.showAlert('Thank you for your message! We\'ll respond soon.', 'success');
                contactForm.reset();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = 'var(--white)';
        navbar.style.backdropFilter = 'none';
    }
});