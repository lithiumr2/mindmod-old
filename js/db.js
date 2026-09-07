class Database {
    constructor() {
        this.dbName = 'MindustryModStudioDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('projects')) {
                    db.createObjectStore('projects', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('files')) {
                    const fileStore = db.createObjectStore('files', { keyPath: 'id' });
                    fileStore.createIndex('projectId', 'projectId', { unique: false });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async getAllProjects() {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('projects', 'readonly');
            const store = tx.objectStore('projects');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async createProject(project) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['projects', 'files'], 'readwrite');
            const projectStore = tx.objectStore('projects');
            const fileStore = tx.objectStore('files');

            projectStore.add(project);

            const modFile = {
                id: `${project.id}_mod_json`,
                projectId: project.id,
                name: 'mod.json',
                path: 'mod.json',
                type: 'json',
                content: JSON.stringify({
                    name: project.name,
                    displayName: project.name,
                    author: project.author,
                    description: project.description,
                    version: project.version,
                    minGameVersion: '146'
                }, null, 2)
            };
            fileStore.add(modFile);

            tx.oncomplete = () => resolve(project);
            tx.onerror = () => reject(tx.error);
        });
    }

    async getProjectFiles(projectId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('files', 'readonly');
            const store = tx.objectStore('files');
            const index = store.index('projectId');
            const req = index.getAll(projectId);
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async saveFile(file) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            const req = store.put(file);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }
}

const db = new Database();
