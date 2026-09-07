const SpriteEngine = {
  init() {
    this.modalOverlay = document.getElementById('modal-overlay');
    this.spriteModal = document.getElementById('sprite-modal');
    this.targetSelect = document.getElementById('sprite-target-select');
    this.fileInput = document.getElementById('sprite-upload');
    
    document.getElementById('open-sprite-modal-btn').addEventListener('click', () => this.openModal());
    document.getElementById('cancel-sprite-btn').addEventListener('click', () => this.closeModal());
    document.getElementById('confirm-sprite-btn').addEventListener('click', () => this.processSprite());
  },

  async openModal() {
    this.targetSelect.innerHTML = '';
    const files = await DB.getAllFiles();
    
    files.forEach(file => {
      if (file.name === 'mod.json' || file.type === 'image') return;
      const opt = document.createElement('option');
      opt.value = file.name.replace('.hjson', '');
      opt.textContent = file.name;
      this.targetSelect.appendChild(opt);
    });

    this.modalOverlay.classList.remove('hidden');
    this.spriteModal.classList.remove('hidden');
  },

  closeModal() {
    this.modalOverlay.classList.add('hidden');
    this.spriteModal.classList.add('hidden');
    this.fileInput.value = '';
  },

  async processSprite() {
    const targetName = this.targetSelect.value;
    const file = this.fileInput.files[0];
    
    if (!targetName || !file) {
      alert('Selecciona un elemento y un archivo PNG.');
      return;
    }

    // Auditoría de Hitbox geométrica
    const fileData = await DB.getFile(`${targetName}.hjson`);
    let blockSize = 1;
    if (fileData) {
      const parsed = HjsonEngine.parse(fileData.content);
      if (parsed.size) blockSize = Number(parsed.size);
    }

    const expectedPixels = blockSize * 32;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        if (img.width !== expectedPixels || img.height !== expectedPixels) {
          alert(`Error geométrico de Hitbox: El sprite debe medir exactamente ${expectedPixels}x${expectedPixels} px (para size: ${blockSize}). Tu imagen mide ${img.width}x${img.height} px.`);
          return;
        }

        await DB.saveFile(`sprites/${targetName}.png`, e.target.result, 'image');
        alert(`Sprite de "${targetName}" validado y vinculado con éxito.`);
        this.closeModal();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
