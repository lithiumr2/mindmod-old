const ZipExporter = {
  init() {
    document.getElementById('export-zip-btn').addEventListener('click', () => this.exportMod());
  },

  async exportMod() {
    if (typeof JSZip === 'undefined') {
      await this.loadJSZip();
    }

    const zip = new JSZip();
    const files = await DB.getAllFiles();

    if (files.length === 0) {
      alert('No hay elementos en el proyecto para exportar.');
      return;
    }

    const spritesFolder = zip.folder('sprites');
    const contentFolder = zip.folder('content');
    const blocksFolder = contentFolder.folder('blocks');
    const itemsFolder = contentFolder.folder('items');
    const liquidsFolder = contentFolder.folder('liquids');

    for (const file of files) {
      if (file.name === 'mod.json') {
        zip.file('mod.json', file.content);
      } else if (file.type === 'image') {
        const base64Data = file.content.split(',')[1];
        spritesFolder.file(file.name.replace('sprites/', ''), base64Data, { base64: true });
      } else {
        const parsed = HjsonEngine.parse(file.content);
        const type = (parsed.type || 'Block').toLowerCase();
        
        if (type.includes('item')) {
          itemsFolder.file(file.name, file.content);
        } else if (type.includes('liquid')) {
          liquidsFolder.file(file.name, file.content);
        } else {
          blocksFolder.file(file.name, file.content);
        }
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    
    const modJsonFile = files.find(f => f.name === 'mod.json');
    let modName = 'mindmod';
    if (modJsonFile) {
      const parsedMod = HjsonEngine.parse(modJsonFile.content);
      if (parsedMod.name) modName = parsedMod.name.toLowerCase().replace(/\s+/g, '-');
    }

    a.download = `${modName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  loadJSZip() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject('Error al cargar JSZip.');
      document.head.appendChild(script);
    });
  }
};
