class MultiUserRoutinePlanner {
    constructor() {
        this.userKey = null;
        this.routines = this.getDefaultRoutines();
        this.mode = 'auth';
        this.saveTimeout = null;
        this.isOnline = navigator.onLine;
        this.nextId = 13;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.startAutoSave();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        window.addEventListener('beforeunload', () => {
            if (this.userKey) {
                this.saveRoutines();
            }
        });
    }

    getDefaultRoutines() {
        return {
            morning: [
                { id: 1, task: 'Wake up at 6:30 AM', completed: false },
                { id: 2, task: 'Drink a glass of water', completed: false },
                { id: 3, task: '10 minutes meditation', completed: false },
                { id: 4, task: 'Exercise for 30 minutes', completed: false },
                { id: 5, task: 'Healthy breakfast', completed: false }
            ],
            afternoon: [
                { id: 6, task: 'Review daily goals', completed: false },
                { id: 7, task: 'Take a 15-minute walk', completed: false },
                { id: 8, task: 'Healthy lunch', completed: false }
            ],
            evening: [
                { id: 9, task: 'Wind down - no screens 1 hour before bed', completed: false },
                { id: 10, task: 'Read for 20 minutes', completed: false },
                { id: 11, task: 'Plan tomorrow', completed: false },
                { id: 12, task: 'Sleep by 10:30 PM', completed: false }
            ]
        };
    }

    generateRandomKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    render() {
        const app = document.getElementById('app');
        
        if (this.mode === 'auth') {
            this.renderAuthScreen(app);
        } else {
            this.renderPlannerScreen(app);
        }
    }

    renderAuthScreen(app) {
        app.innerHTML = `
            <div class="auth-container fade-in">
                <div class="auth-card">
                    <h1><i class="fas fa-calendar-day"></i>Daily Routine Planner</h1>
                    <p class="auth-subtitle">Enter your 6-character key or create a new one</p>
                    
                    <input type="text" class="key-input" id="userKeyInput" placeholder="ABCD12" maxlength="6">
                    
                    <button class="btn btn-success" id="useKeyBtn" style="width: 100%; margin-bottom: 12px;">
                        <i class="fas fa-sign-in-alt"></i> Use This Key
                    </button>
                    
                    <button class="btn btn-secondary" id="generateKeyBtn" style="width: 100%;">
                        <i class="fas fa-magic"></i> Generate New Key
                    </button>
                    
                    <div class="privacy-notice">
                        <i class="fas fa-info-circle"></i>
                        Keys and data reset every 24 hours for privacy
                    </div>
                </div>
            </div>
        `;
        
        this.setupAuthEvents();
    }

    renderPlannerScreen(app) {
        const totalTasks = this.getTotalTasks();
        const completedTasks = this.getCompletedTasks();
        const progressPercentage = Math.round((completedTasks / totalTasks) * 100) || 0;

        app.innerHTML = `
            <div class="container fade-in">
                <div class="planner-header">
                    <div class="header-top">
                        <h1><i class="fas fa-calendar-day"></i>Daily Routine Planner</h1>
                        <div class="header-controls">
                            <div class="user-key">
                                <i class="fas fa-key"></i>
                                ${this.userKey}
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-card">
                        <div class="progress-info">
                            <h2><i class="fas fa-chart-line"></i>Today's Progress</h2>
                            <div class="progress-stats">${completedTasks} of ${totalTasks} tasks completed</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                            </div>
                        </div>
                        <div class="progress-percentage">${progressPercentage}%</div>
                    </div>
                </div>
                
                <div class="periods-grid">
                    ${this.renderPeriod('morning', 'Morning', 'fas fa-sun')}
                    ${this.renderPeriod('afternoon', 'Afternoon', 'fas fa-cloud-sun')}
                    ${this.renderPeriod('evening', 'Evening', 'fas fa-moon')}
                </div>
            </div>
        `;
        
        this.setupPlannerEvents();
    }

    renderPeriod(period, title, icon) {
        const tasks = this.routines[period];
        
        return `
            <div class="period-card ${period}">
                <div class="period-header">
                    <i class="${icon}"></i>
                    <h3 class="period-title">${title}</h3>
                </div>
                
                <div class="tasks-list">
                    ${tasks.map(task => this.renderTask(task, period)).join('')}
                </div>
                
                <div class="add-task">
                    <input type="text" class="task-input" placeholder="Add new ${period} task..." data-period="${period}">
                    <button class="add-btn" data-period="${period}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderTask(task, period) {
        return `
            <div class="task-item" data-task-id="${task.id}" data-period="${period}">
                <div class="task-checkbox ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-text ${task.completed ? 'completed' : ''}">${task.task}</div>
                <div class="task-delete" data-task-id="${task.id}" data-period="${period}">
                    <i class="fas fa-trash"></i>
                </div>
            </div>
        `;
    }

    setupAuthEvents() {
        const useKeyBtn = document.getElementById('useKeyBtn');
        const generateKeyBtn = document.getElementById('generateKeyBtn');
        const keyInput = document.getElementById('userKeyInput');

        useKeyBtn.addEventListener('click', () => this.useKey());
        generateKeyBtn.addEventListener('click', () => this.generateKey());
        keyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.useKey();
        });
        keyInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    setupPlannerEvents() {
        const app = document.getElementById('app');

        // Task checkboxes
        app.addEventListener('click', (e) => {
            if (e.target.closest('.task-checkbox')) {
                const taskId = parseInt(e.target.closest('.task-checkbox').dataset.taskId);
                this.toggleTask(taskId);
            }
        });

        // Delete buttons
        app.addEventListener('click', (e) => {
            if (e.target.closest('.task-delete')) {
                const taskId = parseInt(e.target.closest('.task-delete').dataset.taskId);
                const period = e.target.closest('.task-delete').dataset.period;
                this.deleteTask(taskId, period);
            }
        });

        // Add task buttons
        app.addEventListener('click', (e) => {
            if (e.target.closest('.add-btn')) {
                const period = e.target.closest('.add-btn').dataset.period;
                const input = document.querySelector(`input[data-period="${period}"]`);
                if (input.value.trim()) {
                    this.addTask(period, input.value.trim());
                    input.value = '';
                }
            }
        });

        // Enter key for adding tasks
        app.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('task-input')) {
                const period = e.target.dataset.period;
                if (e.target.value.trim()) {
                    this.addTask(period, e.target.value.trim());
                    e.target.value = '';
                }
            }
        });
    }

    useKey() {
        const keyInput = document.getElementById('userKeyInput');
        const key = keyInput.value.trim().toUpperCase();

        if (key.length === 6) {
            this.userKey = key;
            this.mode = 'planner';
            this.loadUserData();
        } else {
            alert('Please enter exactly 6 characters');
        }
    }

    generateKey() {
        const newKey = this.generateRandomKey();
        const keyInput = document.getElementById('userKeyInput');
        keyInput.value = newKey;
        this.userKey = newKey;
        this.mode = 'planner';
        this.render();
    }

    toggleTask(taskId) {
        for (const period in this.routines) {
            const task = this.routines[period].find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                this.render();
                this.scheduleAutoSave();
                break;
            }
        }
    }

    addTask(period, taskText) {
        const newTask = {
            id: this.nextId++,
            task: taskText,
            completed: false
        };
        this.routines[period].push(newTask);
        this.render();
        this.scheduleAutoSave();
    }

    deleteTask(taskId, period) {
        this.routines[period] = this.routines[period].filter(task => task.id !== taskId);
        this.render();
        this.scheduleAutoSave();
    }

    getTotalTasks() {
        return Object.values(this.routines).reduce((total, tasks) => total + tasks.length, 0);
    }

    getCompletedTasks() {
        return Object.values(this.routines).reduce((total, tasks) => 
            total + tasks.filter(task => task.completed).length, 0);
    }

    async loadUserData() {
        try {
            if (window.supabase && this.isOnline) {
                const data = await window.supabase.select('routines', `?user_key=eq.${this.userKey}`);
                if (data && data.length > 0) {
                    this.routines = JSON.parse(data[0].routines_data);
                    this.nextId = Math.max(...Object.values(this.routines).flat().map(t => t.id)) + 1;
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
        this.render();
    }

    async saveRoutines() {
        if (!this.userKey) return;

        try {
            const routineData = {
                user_key: this.userKey,
                routines_data: JSON.stringify(this.routines),
                updated_at: new Date().toISOString()
            };

            if (window.supabase && this.isOnline) {
                const existing = await window.supabase.select('routines', `?user_key=eq.${this.userKey}`);
                
                if (existing && existing.length > 0) {
                    await window.supabase.update('routines', routineData, `?user_key=eq.${this.userKey}`);
                } else {
                    await window.supabase.insert('routines', routineData);
                }
            }
        } catch (error) {
            console.error('Error saving routines:', error);
        }
    }

    scheduleAutoSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.saveRoutines();
        }, 2000);
    }

    startAutoSave() {
        if (this.userKey) {
            setInterval(() => {
                this.saveRoutines();
            }, 30000);
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new MultiUserRoutinePlanner();
});
