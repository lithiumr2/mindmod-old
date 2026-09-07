const SpriteViewer = {
  renderSpriteGallery(container) {
    container.innerHTML = '';

    const title = document.createElement('h3');
    title.textContent = '🖼️ Galería de Texturas y Sprites del Mod';
    title.style.color = '#fbc02d';
    title.style.marginBottom = '12px';
    container.appendChild(title);

    const galleryContent = document.createElement('div');
    container.appendChild(galleryContent);

    this.loadGalleryGrid(galleryContent);
  },

  async loadGalleryGrid(wrapper) {
    wrapper.innerHTML = '';
    const files = await DB.getAllFiles();
    const spriteFiles = files.filter(f => f.type === 'image');

    if (spriteFiles.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'No hay texturas PNG cargadas todavía. Usa el botón "Vincular Sprite PNG" para añadir imágenes a tus bloques o ítems.';
      msg.style.color = '#a0a0b0';
      msg.style.fontStyle = 'italic';
      wrapper.appendChild(msg);
      return;
    }

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(110px, 1fr))';
    grid.style.gap = '12px';

    spriteFiles.forEach(sprite => {
      const card = document.createElement('div');
      card.style.background = '#222228';
      card.style.border = '1px solid #3a3a48';
      card.style.borderRadius = '6px';
      card.style.padding = '10px';
      card.style.textAlign = 'center';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.alignItems = 'center';
      card.style.gap = '6px';

      const img = document.createElement('img');
      img.src = sprite.content;
      img.style.width = '64px';
      img.style.height = '64px';
      img.style.objectFit = 'contain';
      img.style.imageRendering = 'pixelated'; // Esencial para gráficos pixel-art de Mindustry
      img.style.background = '#18181c';
      img.style.borderRadius = '4px';
      img.style.border = '1px solid #2a2a32';

      // Obtener dimensiones reales de la imagen cargada
      const nameSpan = document.createElement('span');
      nameSpan.textContent = sprite.name.replace('sprites/', '');
      nameSpan.style.fontSize = '12px';
      nameSpan.style.color = '#e0e0e0';
      nameSpan.style.wordBreak = 'break-all';
      nameSpan.style.fontWeight = 'bold';

      const imgObj = new Image();
      imgObj.onload = () => {
        const dimSpan = document.createElement('span');
        dimSpan.textContent = `${imgObj.width}x${imgObj.height} px`;
        dimSpan.style.fontSize = '10px';
        dimSpan.style.color = '#808090';
        card.insertBefore(dimSpan, delBtn);
      };
      imgObj.src = sprite.content;

      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️ Eliminar';
      delBtn.style.background = '#d32f2f';
      delBtn.style.border = 'none';
      delBtn.style.color = 'white';
      delBtn.style.fontSize = '10px';
      delBtn.style.padding = '3px 8px';
      delBtn.style.borderRadius = '4px';
      delBtn.style.cursor = 'pointer';
      delBtn.style.marginTop = '4px';

      delBtn.onclick = async () => {
        if (confirm(`¿Estás seguro de eliminar el archivo de textura "${sprite.name}"?`)) {
          await DB.deleteFile(sprite.name);
          this.loadGalleryGrid(wrapper);
        }
      };

      card.appendChild(img);
      card.appendChild(nameSpan);
      card.appendChild(delBtn);
      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
  }
};
