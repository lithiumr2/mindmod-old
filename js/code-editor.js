class CodeEditor {
    render(file, container) {
        container.innerHTML = `
            <div class="editor-wrapper" style="padding: 1rem; height: 100%; display: flex; flex-direction: column;">
                <textarea id="active-file-textarea" style="width: 100%; flex: 1; background: #1e222b; color: #abb2bf; border: 1px solid #3e4451; border-radius: 4px; padding: 10px; font-family: monospace; resize: none;">${file.content || ''}</textarea>
                <div style="margin-top: 10px; text-align: right;">
                    <button id="save-file-btn" class="btn btn-primary btn-sm">Guardar Cambios</button>
                </div>
            </div>
        `;

        document.getElementById('save-file-btn').addEventListener('click', async () => {
            const updatedContent = document.getElementById('active-file-textarea').value;
            file.content = updatedContent;
            await db.saveFile(file);
            alert('Archivo guardado correctamente.');
        });
    }
}

const codeEditor = new CodeEditor();
