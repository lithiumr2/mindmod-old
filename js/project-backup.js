const ProjectBackup = {
  async exportWholeProject() {
    const files = await DB.getAllFiles();
    const projectData = {
      version: "1.0",
      timestamp: Date.now(),
      files: files
    };

    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Obtener nombre del mod para el archivo de respaldo
    const modJson = files.find(f => f.name === 'mod.json');
    let projectName = 'mindmod-project';
    if (modJson) {
      const parsed = HjsonEngine.parse(modJson.content);
      if (parsed.name) projectName = parsed.name.toLowerCase().replace(/\s+/g, '-');
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.mindmod`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importWholeProject(fileEvent, callback) {
    const file = fileEvent.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.files || !Array.isArray(data.files)) {
          alert('Error: El archivo de respaldo no es válido o está corrupto.');
          return;
        }

        for (const fileRecord of data.files) {
          await DB.saveFile(fileRecord.name, fileRecord.content, fileRecord.type || 'hjson');
        }

        alert('¡Proyecto restaurado con éxito!');
        if (callback) callback();
      } catch (err) {
        alert('Error al leer el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
  }
};
