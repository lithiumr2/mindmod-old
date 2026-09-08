class UIController {
  constructor() {
    this.bindEvents();
  }

  render() {
    const app = document.getElementById('app') || document.body;
    
    // Interfaz limpia, profesional, en inglés y sin emojis
    app.innerHTML = `
      <div class="dashboard-container">
        <header class="dashboard-header">
          <h1>Mindmod</h1>
          <div class="header-actions">
            <button id="btn-wiki" class="btn-secondary">Wiki / Docs</button>
            <button id="btn-export" class="btn-primary">Export (.zip)</button>
          </div>
        </header>

        <section class="main-actions">
          <button id="btn-new-element" class="btn-accent">+ New Item</button>
          
          <div class="action-list">
            <button class="action-item" data-action="mod-json">mod.json</button>
            <button class="action-item" data-action="audit">Audit Mod</button>
            <button class="action-item" data-action="textures">View Textures</button>
            <button class="action-item" data-action="save">Save Backup</button>
            <button class="action-item" data-action="load">Load Backup</button>
            <button class="action-item" data-action="sprite">Link Sprite</button>
            <button class="action-item" data-action="property">+ Add Property</button>
          </div>
        </section>

        <footer class="console-footer">
          <div id="console-toggle">Mindmod System Console</div>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Conexión segura de eventos para que los botones respondan al hacer clic
    document.querySelectorAll('.action-item, #btn-new-element, #btn-wiki, #btn-export').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action') || e.target.id;
        this.handleAction(action);
      });
    });
  }

  handleAction(action) {
    switch(action) {
      case 'btn-new-element':
      case 'property':
        console.log('Action triggered: New Element / Property');
        break;
      case 'mod-json':
        console.log('Action triggered: mod.json editor');
        break;
      case 'audit':
        console.log('Action triggered: Mod audit');
        break;
      case 'textures':
        console.log('Action triggered: Texture viewer');
        break;
      case 'save':
        console.log('Action triggered: Save backup');
        break;
      case 'load':
        console.log('Action triggered: Load backup');
        break;
      case 'sprite':
        console.log('Action triggered: Link sprite');
        break;
      case 'btn-wiki':
        console.log('Opening Wiki');
        break;
      case 'btn-export':
        console.log('Exporting ZIP');
        break;
      default:
        break;
    }
  }
}

window.uiController = new UIController();
