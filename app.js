class MultiUserRoutinePlanner {
    constructor() {
        this.userKey     = null;
        this.routines    = this.getDefaultRoutines();
        this.notes       = '';
        this.mode        = 'auth';
        this.saveTimeout = null;
        this.nextId      = 13;
        this.init();
    }

    init() {
        this.setupGlobalListeners();
        this.render();
        this.startPeriodicSave();
    }

    setupGlobalListeners() {
        window.addEventListener('beforeunload', () => {
            if (this.userKey) this.saveRoutines();
        });
    }

    getDefaultRoutines() {
        return {
            morning: [
                { id: 1,  task: 'Wake up at 6:30 AM',                    completed: false },
                { id: 2,  task: 'Drink a glass of water',                 completed: false },
                { id: 3,  task: '10 minutes meditation',                  completed: false },
                { id: 4,  task: 'Exercise for 30 minutes',                completed: false },
                { id: 5,  task: 'Healthy breakfast',                      completed: false }
            ],
            afternoon: [
                { id: 6,  task: 'Review daily goals',                     completed: false },
                { id: 7,  task: 'Take a 15-minute walk',                  completed: false },
                { id: 8,  task: 'Healthy lunch',                          completed: false }
            ],
            evening: [
                { id: 9,  task: 'Wind down — no screens 1 hr before bed', completed: false },
                { id: 10, task: 'Read for 20 minutes',                    completed: false },
                { id: 11, task: 'Plan tomorrow',                          completed: false },
                { id: 12, task: 'Sleep by 10:30 PM',                      completed: false }
            ]
        };
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
                    <h1><i class="fas fa-calendar-day"></i> Daily Routine Planner</h1>
                    <p class="auth-subtitle">Enter your 6-character key or create a new one</p>

                    <input type="text" class="key-input" id="userKeyInput"
                           placeholder="ABCD12" maxlength="6" autocomplete="off">

                    <button class="btn btn-success" id="useKeyBtn" style="width:100%;margin-bottom:12px;">
                        <i class="fas fa-sign-in-alt"></i> Use This Key
                    </button>
                    <button class="btn btn-secondary" id="generateKeyBtn" style="width:100%;">
                        <i class="fas fa-magic"></i> Generate New Key
                    </button>

                    <div class="privacy-notice">
                        <i class="fas fa-info-circle"></i>
                        Your data is stored securely. History is kept for 90 days.
                    </div>
                </div>
            </div>
        `;
        this.setupAuthEvents();
    }

    renderPlannerScreen(app) {
        const total     = this.getTotalTasks();
        const completed = this.getCompletedTasks();
        const pct       = total ? Math.round((completed / total) * 100) : 0;

        app.innerHTML = `
            <div class="container fade-in">
                <div class="planner-header">
                    <div class="header-top">
                        <h1><i class="fas fa-calendar-day"></i> Daily Routine Planner</h1>
                        <div class="header-controls">
                            <div class="user-key"><i class="fas fa-key"></i> ${this.userKey}</div>
                            <button class="btn btn-sm" id="snapshotBtn" title="Save today's snapshot">
                                <i class="fas fa-camera"></i> Save Snapshot
                            </button>
                        </div>
                    </div>

                    <div class="progress-card">
                        <div class="progress-info">
                            <h2><i class="fas fa-chart-line"></i> Today's Progress</h2>
                            <div class="progress-stats">${completed} of ${total} tasks completed</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width:${pct}%"></div>
                            </div>
                        </div>
                        <div class="progress-percentage">${pct}%</div>
                    </div>

                    <div class="streak-bar" id="streakBar"></div>
                </div>

                <div class="periods-grid">
                    ${this.renderPeriod('morning',   'Morning',   'fas fa-sun')}
                    ${this.renderPeriod('afternoon', 'Afternoon', 'fas fa-cloud-sun')}
                    ${this.renderPeriod('evening',   'Evening',   'fas fa-moon')}
                </div>

                <div class="notes-section">
                    <h3><i class="fas fa-sticky-note"></i> Notes</h3>
                    <textarea id="notesArea" placeholder="Add any notes for today...">${this.notes}</textarea>
                    <button class="btn btn-secondary" id="saveNotesBtn">Save Notes</button>
                </div>
            </div>
        `;

        this.setupPlannerEvents();
        this.loadStreak();
    }

    renderPeriod(period, title, icon) {
        return `
            <div class="period-card ${period}">
                <div class="period-header">
                    <i class="${icon}"></i>
                    <h3 class="period-title">${title}</h3>
                </div>
                <div class="tasks-list">
                    ${this.routines[period].map(t => this.renderTask(t, period)).join('')}
                </div>
                <div class="add-task">
                    <input type="text" class="task-input"
                           placeholder="Add new ${period} task…" data-period="${period}">
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
                <div class="task-checkbox ${task.completed ? 'completed' : ''}"
                     data-task-id="${task.id}">
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
        document.getElementById('useKeyBtn')
            .addEventListener('click', () => this.useKey());
        document.getElementById('generateKeyBtn')
            .addEventListener('click', () => this.generateKey());

        const input = document.getElementById('userKeyInput');
        input.addEventListener('keypress', e => { if (e.key === 'Enter') this.useKey(); });
        input.addEventListener('input',    e => { e.target.value = e.target.value.toUpperCase(); });
    }

    setupPlannerEvents() {
        const app = document.getElementById('app');

        app.addEventListener('click', e => {
            const checkbox = e.target.closest('.task-checkbox');
            if (checkbox) {
                e.preventDefault();
                this.toggleTask(parseInt(checkbox.dataset.taskId));
                return;
            }

            const del = e.target.closest('.task-delete');
            if (del) {
                e.preventDefault();
                this.deleteTask(parseInt(del.dataset.taskId), del.dataset.period);
                return;
            }

            const addBtn = e.target.closest('.add-btn');
            if (addBtn) {
                e.preventDefault();
                const period = addBtn.dataset.period;
                const input  = app.querySelector(`input[data-period="${period}"]`);
                if (input?.value.trim()) {
                    this.addTask(period, input.value.trim());
                    input.value = '';
                }
                return;
            }

            if (e.target.closest('#snapshotBtn')) {
                e.preventDefault();
                this.saveSnapshot();
                return;
            }

            if (e.target.closest('#saveNotesBtn')) {
                e.preventDefault();
                this.notes = document.getElementById('notesArea')?.value ?? '';
                this.saveRoutines();
            }
        });

        app.addEventListener('keypress', e => {
            if (e.key === 'Enter' && e.target.classList.contains('task-input')) {
                e.preventDefault();
                const period = e.target.dataset.period;
                if (e.target.value.trim()) {
                    this.addTask(period, e.target.value.trim());
                    e.target.value = '';
                }
            }
        });
    }

    generateRandomKey() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 6 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join('');
    }

    useKey() {
        const key = document.getElementById('userKeyInput')?.value.trim().toUpperCase() ?? '';
        if (key.length !== 6) { alert('Please enter exactly 6 characters'); return; }
        this.userKey = key;
        this.mode    = 'planner';
        this.loadUserData();
    }

    generateKey() {
        this.userKey = this.generateRandomKey();
        this.mode    = 'planner';
        this.loadUserData();
    }

    toggleTask(taskId) {
        for (const period of Object.keys(this.routines)) {
            const task = this.routines[period].find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                this.updateUI();
                this.scheduleSave();
                break;
            }
        }
    }

    addTask(period, taskText) {
        this.routines[period].push({ id: this.nextId++, task: taskText, completed: false });
        this.updateUI();
        this.scheduleSave();
    }

    deleteTask(taskId, period) {
        this.routines[period] = this.routines[period].filter(t => t.id !== taskId);
        this.updateUI();
        this.scheduleSave();
    }

    updateUI() {
        const total     = this.getTotalTasks();
        const completed = this.getCompletedTasks();
        const pct       = total ? Math.round((completed / total) * 100) : 0;

        const stats = document.querySelector('.progress-stats');
        const fill  = document.querySelector('.progress-fill');
        const pctEl = document.querySelector('.progress-percentage');

        if (stats) stats.textContent = `${completed} of ${total} tasks completed`;
        if (fill)  fill.style.width  = `${pct}%`;
        if (pctEl) pctEl.textContent = `${pct}%`;

        for (const period of ['morning', 'afternoon', 'evening']) {
            const list = document.querySelector(`.${period} .tasks-list`);
            if (list) {
                list.innerHTML = this.routines[period]
                    .map(t => this.renderTask(t, period)).join('');
            }
        }
    }

    getTotalTasks() {
        return Object.values(this.routines).reduce((n, tasks) => n + tasks.length, 0);
    }

    getCompletedTasks() {
        return Object.values(this.routines).reduce(
            (n, tasks) => n + tasks.filter(t => t.completed).length, 0
        );
    }

    async loadUserData() {
        try {
            const { data, error } = await db
                .from('user_routines')
                .select('routines_data, notes')
                .eq('user_key', this.userKey)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                this.routines = data.routines_data;
                this.notes    = data.notes ?? '';
                const allIds  = Object.values(this.routines).flat().map(t => t.id);
                this.nextId   = allIds.length ? Math.max(...allIds) + 1 : 1;
            }
        } catch (err) {
            console.error('Error loading user data:', err.message);
        } finally {
            this.render();
        }
    }

    async saveRoutines() {
        if (!this.userKey) return;

        try {
            const { error } = await db
                .from('user_routines')
                .upsert(
                    {
                        user_key:      this.userKey,
                        routines_data: this.routines,
                        notes:         this.notes
                    },
                    { onConflict: 'user_key' }
                );

            if (error) throw error;
        } catch (err) {
            console.error('Error saving routines:', err.message);
        }
    }

    async saveSnapshot() {
        if (!this.userKey) return;

        const total     = this.getTotalTasks();
        const completed = this.getCompletedTasks();
        const today     = new Date().toISOString().split('T')[0];

        try {
            const { error: histError } = await db
                .from('routine_history')
                .upsert(
                    {
                        user_key:        this.userKey,
                        snapshot_date:   today,
                        routines_data:   this.routines,
                        total_tasks:     total,
                        completed_tasks: completed,
                        fully_completed: completed === total && total > 0
                    },
                    { onConflict: 'user_key,snapshot_date' }
                );

            if (histError) throw histError;

            const { error: streakError } = await db
                .rpc('update_streak', {
                    p_user_key:      this.userKey,
                    p_snapshot_date: today
                });

            if (streakError) throw streakError;

            await this.loadStreak();
            alert('Snapshot saved! ✅');
        } catch (err) {
            console.error('Error saving snapshot:', err.message);
            alert('Could not save snapshot. Please try again.');
        }
    }

    async loadStreak() {
        if (!this.userKey) return;

        try {
            const { data, error } = await db
                .from('streaks')
                .select('current_streak, longest_streak, last_completed')
                .eq('user_key', this.userKey)
                .maybeSingle();

            if (error) throw error;

            const bar = document.getElementById('streakBar');
            if (!bar) return;

            bar.innerHTML = data
                ? `<span title="Current streak">🔥 ${data.current_streak} day streak</span>
                   <span title="Longest streak" class="streak-best">🏆 Best: ${data.longest_streak} days</span>`
                : `<span>Complete all tasks and hit "Save Snapshot" to start your streak!</span>`;
        } catch (err) {
            console.error('Error loading streak:', err.message);
        }
    }

    scheduleSave() {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this.saveRoutines(), 2000);
    }

    startPeriodicSave() {
        setInterval(() => {
            if (this.userKey) this.saveRoutines();
        }, 30_000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MultiUserRoutinePlanner();
});
