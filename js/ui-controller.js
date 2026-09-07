const UIController = {
  currentData: {},
  isVisualMode: false, // Inicia en modo código por defecto hasta que cargue

  init() {
    this.visualPanel = document.getElementById('visual-panel');
    this.codePanel = document.getElementById('code-panel');
    this.formContainer = document.getElementById('form-container');
    this.toggleBtn = document.getElementById('toggle-view-btn');
    this.addPropBtn = document.getElementById('add-prop-btn');
    
    this.bindEvents();
  },

  bindEvents() {
    this.toggleBtn.addEventListener('click', () => this.toggleEditorView());
    this.addPropBtn.addEventListener('click', () => this.addNewProperty());
  },

  // Carga el archivo desde App.js y decide cómo mostrarlo
  loadEditorContext(content, filename) {
    this.currentData = HjsonEngine.parse(content) || {};
    
    // Si es mod.json o un archivo nuevo, mostramos la vista visual
    this.isVisualMode = true;
    this.renderVisualForm();
    this.updateVisibility();
  },

  updateVisibility() {
    if (this.isVisualMode) {
      this.visualPanel.classList.remove('hidden');
      this.codePanel.classList.add('hidden');
      this.toggleBtn.textContent = '👁️ Ver Código';
    } else {
      this.visualPanel.classList.add('hidden');
      this.codePanel.classList.remove('hidden');
      this.toggleBtn.textContent = '📋 Ver Formulario Visual';
      
      // Al pasar a código, volcamos los datos visuales al texto
      document.getElementById('code-editor').value = HjsonEngine.stringify(this.currentData);
    }
  },

  toggleEditorView() {
    if (!this.isVisualMode) {
      // Si estábamos en código, intentamos parsear lo escrito antes de pasar a visual
      const rawText = document.getElementById('code-editor').value;
      this.currentData = HjsonEngine.parse(rawText);
      this.renderVisualForm();
    }
    this.isVisualMode = !this.isVisualMode;
    this.updateVisibility();
  },

  // Dibuja los campos basados en el boceto de la libreta
  renderVisualForm() {
    this.formContainer.innerHTML = ''; // Limpiar panel

    for (const [key, value] of Object.entries(this.currentData)) {
      const row = document.createElement('div');
      row.className = 'prop-row';
      row.style.display = 'flex';
      row.style.gap = '10px';
      row.style.marginBottom = '12px';
      row.style.alignItems = 'center';

      const label = document.createElement('label');
      label.textContent = key + ':';
      label.style.width = '120px';
      label.style.color = '#a0a0b0';

      const input = document.createElement('input');
      input.className = 'input-dark';
      input.style.flex = '1';
      input.value = Array.isArray(value) ? value.join(', ') : value;

      // Actualizar memoria en tiempo real al escribir
      input.addEventListener('input', (e) => {
        let val = e.target.value;
        if (!isNaN(val) && val !== '') val = Number(val);
        this.currentData[key] = val;
        this.triggerAutoSave();
      });

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✕';
      removeBtn.style.backgroundColor = '#d32f2f';
      removeBtn.style.color = 'white';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '4px';
      removeBtn.style.width = '35px';
      removeBtn.style.height = '35px';
      removeBtn.style.cursor = 'pointer';
      
      removeBtn.onclick = () => {
        delete this.currentData[key];
        this.renderVisualForm(); // Redibujar
        this.triggerAutoSave();
      };

      row.appendChild(label);
      row.appendChild(input);
      row.appendChild(removeBtn);
      this.formContainer.appendChild(row);
    }
  },

  addNewProperty() {
    const prop = prompt('Nombre de la propiedad (ej. health, size, category):');
    if (prop && !this.currentData[prop]) {
      this.currentData[prop] = ''; // Inicia vacía
      this.renderVisualForm();
      this.triggerAutoSave();
    }
  },

  triggerAutoSave() {
    // Comunica los cambios al App.js para que guarde en la base de datos
    const newText = HjsonEngine.stringify(this.currentData);
    document.getElementById('code-editor').value = newText;
    document.getElementById('code-editor').dispatchEvent(new Event('input'));
  }
};
