const App = {
  async init() {
    // 1. Registrar Service Worker para PWA / Offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker registrado correctamente.'))
        .catch((err) => console.log('Error al registrar Service Worker:', err));
    }

    // 2. Inicializar consola de depuración
    Logger.init();
    Logger.log('Entorno Mindmod listo para operar.', 'success');

    // 3. Inicializar base de datos y componentes principales
    await DB.init();
    await ItemRegistry.init();
    await UIController.init();
    CodeEditor.init();

    // 4. Vincular eventos de las nuevas herramientas de la barra lateral
    const auditBtn = document.getElementById('audit-mod-btn');
    if (auditBtn) {
      auditBtn.addEventListener('click', () => ModValidator.showAuditModal());
    }

    const viewSpritesBtn = document.getElementById('view-sprites-btn');
    if (viewSpritesBtn) {
      viewSpritesBtn.addEventListener('click', () => {
        const formContainer = document.getElementById('form-container');
        if (formContainer) {
          // Cambiar a vista visual si estaba en código
          document.getElementById('visual-panel').classList.remove('hidden');
          document.getElementById('code-panel').classList.add('hidden');
          document.getElementById('toggle-view-btn').textContent = '👁️ Ver Código';
          SpriteViewer.renderSpriteGallery(formContainer);
          Logger.log('Galería de texturas abierta.', 'info');
        }
      });
    }

    const backupBtn = document.getElementById('backup-project-btn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        ProjectBackup.exportWholeProject();
        Logger.log('Respaldo del proyecto exportado con éxito.', 'success');
      });
    }

    const importInput = document.getElementById('import-project-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        ProjectBackup.importWholeProject(e, async () => {
          await UIController.refreshFileList();
          UIController.loadFile('mod.json');
          Logger.log('Proyecto restaurado desde copia de seguridad.', 'success');
        });
      });
    }

    Logger.log('Todos los módulos y eventos vinculados con éxito.', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
