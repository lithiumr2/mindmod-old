const Logger = {
  consoleElement: null,
  isMinimized: true,

  init() {
    if (document.getElementById('debug-console')) return;

    const container = document.createElement('div');
    container.id = 'debug-console';
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '140px';
    container.style.background = '#141418';
    container.style.borderTop = '1px solid #3a3a48';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.zIndex = '9999';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = '12px';
    container.style.transition = 'transform 0.3s ease';
    container.style.transform = 'translateY(110px)'; // Minimizado por defecto

    // Barra superior de la consola
    const header = document.createElement('div');
    header.style.background = '#1e1e24';
    header.style.padding = '4px 10px';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.cursor = 'pointer';
    header.style.borderBottom = '1px solid #2a2a32';

    const title = document.createElement('span');
    title.textContent = '🛠️ Consola de Sistema Mindmod';
    title.style.color = '#fbc02d';
    title.style.fontWeight = 'bold';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '▲ Maximizar';
    toggleBtn.style.background = 'transparent';
    toggleBtn.style.border = 'none';
    toggleBtn.style.color = '#a0a0b0';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.fontSize = '11px';

    header.appendChild(title);
    header.appendChild(toggleBtn);

    // Contenedor de logs internos
    const logBox = document.createElement('div');
    logBox.id = 'debug-log-content';
    logBox.style.flex = '1';
    logBox.style.overflowY = 'auto';
    logBox.style.padding = '6px 10px';
    logBox.style.display = 'flex';
    logBox.style.flexDirection = 'column';
    logBox.style.gap = '4px';

    container.appendChild(header);
    container.appendChild(logBox);
    document.body.appendChild(container);

    header.onclick = () => {
      this.isMinimized = !this.isMinimized;
      container.style.transform = this.isMinimized ? 'translateY(110px)' : 'translateY(0)';
      toggleBtn.textContent = this.isMinimized ? '▲ Maximizar' : '▼ Minimizar';
    };

    this.consoleElement = logBox;
    this.log('Sistema de depuración inicializado correctamente.', 'info');
  },

  log(message, type = 'info') {
    if (!this.consoleElement) this.init();

    const entry = document.createElement('div');
    entry.style.display = 'flex';
    entry.style.gap = '8px';

    const time = document.createElement('span');
    const now = new Date();
    time.textContent = `[${now.toTimeString().split(' ')[0]}]`;
    time.style.color = '#606070';

    const text = document.createElement('span');
    text.textContent = message;

    if (type === 'error') {
      text.style.color = '#ef5350';
    } else if (type === 'warn') {
      text.style.color = '#ffb74d';
    } else if (type === 'success') {
      text.style.color = '#81c784';
    } else {
      text.style.color = '#e0e0e0';
    }

    entry.appendChild(time);
    entry.appendChild(text);
    this.consoleElement.appendChild(entry);
    this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
  }
};
