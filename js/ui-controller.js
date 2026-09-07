const UIController = {
  currentFile: null,
  currentData: {},
  isVisualMode: true,

  async init() {
    await this.refreshFileList();
    this.setupEvents();
    
    // Cargar por defecto el archivo de configuración mod.json si existe
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
      if (file.type === 'image') return; // Las imágenes se gestionan desde la galería de texturas

      const li = document.createElement('li');
      li.className = 'file-item';
      if (file.name === this.currentFile) li.classList.add('active');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = file.name;
      nameSpan.style.cursor = 'pointer';
      nameSpan.style.flex = '1';
      nameSpan.onclick = () => this.loadFile(file.name);

      li.appendChild(nameSpan);

      // Botón para eliminar archivo (excepto mod.json)
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
          if (confirm(`¿Eliminar el archivo "${file.name}"?`)) {
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
    
    this.updateVisibility();
  },

  renderVisualForm() {
    const container = document.getElementById('form-container');
    if (!container) return;
    container.innerHTML = '';

    // 1. Inyectar selector de plantillas rápidas si el objeto está vacío o es un bloque nuevo
    BlockTemplates.renderTemplateSelector(container, (templateData) => {
      this.currentData = templateData;
      this.renderVisualForm();
      this.triggerAutoSave();
    });

    // 2. Renderizar propiedades dinámicas del Hjson
    for (const [key, value] of Object.entries(this.currentData)) {
      if (key === 'bullet') continue; // Se maneja de forma exclusiva en el BulletEditor

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

      // Validación para listas de requerimientos o consumos de materiales/líquidos
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

    // 3. Inyectar editor especializado de proyectiles si el bloque es torreta o contiene balas
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
      status.textContent = 'Guardado automático...';
      setTimeout(() => { status.textContent = 'Guardado'; }, 1000);
    }
  },

  setupEvents() {
    // Alternar entre modo visual y código crudo
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
            toggleBtn.textContent = '👁️ Ver Código';
          } catch (err) {
            alert('Error de sintaxis Hjson. Corrige el código antes de cambiar a la vista visual.');
            this.isVisualMode = false;
          }
        } else {
          codeEditor.value = HjsonEngine.stringify(this.currentData);
          visualPanel.classList.add('hidden');
          codePanel.classList.remove('hidden');
          toggleBtn.textContent = '👁️ Ver Visual';
        }
      };
    }

    // Botón para crear nuevo elemento / bloque
    const newBtn = document.getElementById('new-element-btn');
    if (newBtn) {
      newBtn.onclick = async () => {
        const name = prompt('Nombre del nuevo elemento o bloque (ej. mega-wall):');
        if (!name) return;
        const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace('.hjson', '') + '.hjson';
        
        const defaultContent = '{\n  name: "nuevo-bloque"\n  type: "Wall"\n  health: 300\n  size: 1\n  requirements: [\n    "copper/10"\n  ]\n}';
        await DB.saveFile(cleanName, defaultContent, 'hjson');
        await this.refreshFileList();
        this.loadFile(cleanName);
      };
    }

    // Botón de acceso directo a mod.json
    const modJsonBtn = document.getElementById('mod-json-btn');
    if (modJsonBtn) {
      modJsonBtn.onclick = () => this.loadFile('mod.json');
    }

    // Añadir propiedad personalizada al bloque actual
    const addPropBtn = document.getElementById('add-prop-btn');
    if (addPropBtn) {
      addPropBtn.onclick = () => {
        const propName = prompt('Nombre de la nueva propiedad (ej. reload, range, armor):');
        if (!propName) return;
        this.currentData[propName] = '';
        this.renderVisualForm();
        this.triggerAutoSave();
      };
    }
  },

  updateVisibility() {
    // Control adicional de paneles si se requiere
  }
};
