const UIController = {
  currentFile: null,
  currentData: {},
  isVisualMode: true,

  async init() {
    await this.refreshFileList();
    this.setupEvents();
    
    const files = await DB.getAllFiles();
    const modJson = files.find(f => f.name === 'mod.json');
    if (modJson) {
      this.loadFile('mod.json');
    } else if (files.length > 0) {
      this.loadFile(files[0].name);
    }
  },

  async refreshFileList() {
    const listEl = document.getElementById('file-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const files = await DB.getAllFiles();
    files.forEach(file => {
      if (file.type === 'image') return;

      const li = document.createElement('li');
      li.className = 'file-item';
      if (file.name === this.currentFile) li.classList.add('active');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = file.name;
      nameSpan.style.cursor = 'pointer';
      nameSpan.style.flex = '1';
      nameSpan.onclick = () => this.loadFile(file.name);

      li.appendChild(nameSpan);

      if (file.name !== 'mod.json') {
        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.className = 'btn-delete-file';
        delBtn.style.background = 'transparent';
        delBtn.style.border = 'none';
        delBtn.style.color = '#ef5350';
        delBtn.style.cursor = 'pointer';
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          if (confirm(`Delete file "${file.name}"?`)) {
            await DB.deleteFile(file.name);
            await this.refreshFileList();
          }
        };
        li.appendChild(delBtn);
      }

      listEl.appendChild(li);
    });
  },

  async loadFile(filename) {
    this.currentFile = filename;
    const file = await DB.getFile(filename);
    if (!file) return;

    this.loadEditorContext(file.content, filename);
    await this.refreshFileList();
  },

  loadEditorContext(content, filename) {
    this.currentData = HjsonEngine.parse(content) || {};
    this.isVisualMode = true;
    
    const formContainer = document.getElementById('form-container');
    if (!formContainer) return;

    formContainer.innerHTML = '';
    
    if (filename === 'mod.json') {
      ModManager.renderModJsonForm(formContainer, this.currentData, () => {
        this.triggerAutoSave();
      });
    } else {
      this.renderVisualForm();
    }
  },

  renderVisualForm() {
    const container = document.getElementById('form-container');
    if (!container) return;
    container.innerHTML = '';

    BlockTemplates.renderTemplateSelector(container, (templateData) => {
      this.currentData = templateData;
      this.renderVisualForm();
      this.triggerAutoSave();
    });

    for (const [key, value] of Object.entries(this.currentData)) {
      if (key === 'bullet') continue;

      const row = document.createElement('div');
      row.className = 'prop-row';
      row.style.display = 'flex';
      row.style.gap = '10px';
      row.style.marginBottom = '10px';
      row.style.alignItems = 'center';

      const label = document.createElement('label');
      label.textContent = key + ':';
      label.style.width = '140px';
      label.style.color = '#a0a0b0';

      let inputContainer = document.createElement('div');
      inputContainer.style.flex = '1';

      if (['requirements', 'consumes', 'output'].includes(key.toLowerCase()) || Array.isArray(value)) {
        ItemRegistry.renderResourceInput(key, Array.isArray(value) ? value : [value], inputContainer, (updatedArray) => {
          this.currentData[key] = updatedArray;
          this.triggerAutoSave();
        });
      } else {
        const input = document.createElement('input');
        input.className = 'input-dark';
        input.style.width = '100%';
        input.value = value;
        
        input.addEventListener('input', (e) => {
          let val = e.target.value;
          if (!isNaN(val) && val !== '') val = Number(val);
          this.currentData[key] = val;
          this.triggerAutoSave();
        });
        inputContainer.appendChild(input);
      }

      row.appendChild(label);
      row.appendChild(inputContainer);
      container.appendChild(row);
    }

    const blockType = (this.currentData.type || '').toLowerCase();
    if (blockType.includes('turret') || this.currentData.bullet !== undefined) {
      BulletEditor.renderBulletSection(container, this.currentData, () => {
        this.triggerAutoSave();
      });
    }
  },

  triggerAutoSave() {
    if (!this.currentFile) return;
    const hjsonString = HjsonEngine.stringify(this.currentData);
    DB.saveFile(this.currentFile, hjsonString, 'hjson');
    
    const status = document.getElementById('status-indicator');
    if (status) {
      status.textContent = 'Saving...';
      setTimeout(() => { status.textContent = 'Ready'; }, 1000);
    }
  },

  setupEvents() {
    const toggleBtn = document.getElementById('toggle-view-btn');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        this.isVisualMode = !this.isVisualMode;
        const visualPanel = document.getElementById('visual-panel');
        const codePanel = document.getElementById('code-panel');
        const codeEditor = document.getElementById('code-editor');

        if (this.isVisualMode) {
          try {
            this.currentData = HjsonEngine.parse(codeEditor.value);
            this.loadEditorContext(codeEditor.value, this.currentFile);
            visualPanel.classList.remove('hidden');
            codePanel.classList.add('hidden');
            toggleBtn.textContent = 'View Code';
          } catch (err) {
            alert('Hjson syntax error. Fix the code before switching to visual mode.');
            this.isVisualMode = false;
          }
        } else {
          codeEditor.value = HjsonEngine.stringify(this.currentData);
          visualPanel.classList.add('hidden');
          codePanel.classList.remove('hidden');
          toggleBtn.textContent = 'View Visual';
        }
      };
    }

    const newBtn = document.getElementById('new-element-btn');
    if (newBtn) {
      newBtn.onclick = async () => {
        const name = prompt('New element name (e.g. mega-wall):');
        if (!name) return;
        const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace('.hjson', '') + '.hjson';
        
        const defaultContent = '{\n  name: "new-block"\n  type: "Wall"\n  health: 300\n  size: 1\n  requirements: [\n    "copper/10"\n  ]\n}';
        await DB.saveFile(cleanName, defaultContent, 'hjson');
        await this.refreshFileList();
        this.loadFile(cleanName);
      };
    }

    const modJsonBtn = document.getElementById('mod-json-btn');
    if (modJsonBtn) {
      modJsonBtn.onclick = () => this.loadFile('mod.json');
    }

    const addPropBtn = document.getElementById('add-prop-btn');
    if (addPropBtn) {
      addPropBtn.onclick = () => {
        const propName = prompt('New property name (e.g. reload, range, armor):');
        if (!propName) return;
        this.currentData[propName] = '';
        this.renderVisualForm();
        this.triggerAutoSave();
      };
    }
  }
};
                                                          
