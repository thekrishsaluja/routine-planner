class MultiUserRoutinePlanner {
    constructor() {
        this.userKey = null;
        this.routines = this.getDefaultRoutines();
        this.mode = 'login';
        this.saveTimeout = null;
        this.isOnline = navigator.onLine;
        
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
