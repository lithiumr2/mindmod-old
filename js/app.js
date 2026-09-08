const App = {
  async init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Service Worker registrado correctamente.'))
        .catch((err) => console.log('Error al registrar Service Worker:', err));
    }

    Logger.init();
    Logger.log('Entorno Mindmod listo para operar.', 'success');

    await DB.init();
    await UIController.init();
    CodeEditor.init();

    const auditBtn = document.getElementById('audit-mod-btn');
    if (auditBtn) {
      auditBtn.addEventListener('click', () => ModValidator.showAuditModal());
    }

    const viewSpritesBtn = document.getElementById('view-sprites-btn');
    if (viewSpritesBtn) {
      viewSpritesBtn.addEventListener('click', () => {
        const formContainer = document.getElementById('form-container');
        if (formContainer) {
          document.getElementById('visual-panel').classList.remove('hidden');
          document.getElementById('code-panel').classList.add('hidden');
          document.getElementById('toggle-view-btn').textContent = 'View Code';
          SpriteViewer.renderSpriteGallery(formContainer);
          Logger.log('Texture gallery opened.', 'info');
        }
      });
    }

    const backupBtn = document.getElementById('backup-project-btn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        ProjectBackup.exportWholeProject();
        Logger.log('Project backup exported successfully.', 'success');
      });
    }

    const importInput = document.getElementById('import-project-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        ProjectBackup.importWholeProject(e, async () => {
          await UIController.refreshFileList();
          UIController.loadFile('mod.json');
          Logger.log('Project restored from backup.', 'success');
        });
      });
    }

    Logger.log('All modules and events bound successfully.', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
