class SpriteEngine {
    render(file, container) {
        container.innerHTML = `
            <div class="sprite-wrapper" style="padding: 1rem; text-align: center;">
                <h3>${file.name}</h3>
                <div style="margin: 20px auto; width: 128px; height: 128px; border: 2px dashed #3e4451; display: flex; align-items: center; justify-content: center; background: #181a1f;">
                    ${file.content ? `<img src="${file.content}" style="max-width: 100%; max-height: 100%; image-rendering: pixelated;" />` : '<span style="color: #5c6370;">Sin imagen</span>'}
                </div>
                <input type="file" id="sprite-upload-input" accept="image/png" style="display: none;" />
                <button class="btn btn-primary btn-sm" onclick="document.getElementById('sprite-upload-input').click()">Cargar Imagen PNG</button>
            </div>
        `;

        const input = document.getElementById('sprite-upload-input');
        input.addEventListener('change', (e) => {
            const uploadedFile = e.target.files[0];
            if (uploadedFile) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    file.content = event.target.result;
                    await db.saveFile(file);
                    this.render(file, container);
                };
                reader.readAsDataURL(uploadedFile);
            }
        });
    }
}

const spriteEngine = new SpriteEngine();
