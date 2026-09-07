const DB = {
  name: 'MindmodDB',
  version: 1,
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);
      
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'name' });
        }
      };
      
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      
      request.onerror = () => reject('Error al abrir IndexedDB');
    });
  },

  async saveFile(name, content, type = 'hjson') {
    return new Promise((resolve) => {
      const tx = this.db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.put({ name, content, type, lastModified: Date.now() });
      tx.oncomplete = () => resolve();
    });
  },

  async getFile(name) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const request = store.get(name);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAllFiles() {
    return new Promise((resolve) => {
      const tx = this.db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async deleteFile(name) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      store.delete(name);
      tx.oncomplete = () => resolve();
    });
  },

  async renameFile(oldName, newName) {
    const file = await this.getFile(oldName);
    if (file) {
      await this.saveFile(newName, file.content, file.type);
      await this.deleteFile(oldName);
    }
  }
};
