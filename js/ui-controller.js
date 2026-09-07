class UIController {
    constructor() {
        this.currentProjectId = null;
        this.activeFile = null;
    }

    async loadWorkspace(projectId) {
        this.currentProjectId = projectId;
        const files = await db.getProjectFiles(projectId);
        this.renderFileTree(files);
    }

    renderFileTree(files) {
        const treeContainer = document.getElementById('file-tree');
        treeContainer.innerHTML = '';

        if (files.length === 0) {
            treeContainer.innerHTML = '<p style="padding: 10px; color: #5c6370;">Sin archivos</p>';
            return;
        }

        const list = document.createElement('ul');
        list.style.listStyle = 'none';
        list.style.padding = '0';

        files.forEach(file => {
            const li = document.createElement('li');
            li.style.padding = '8px 12px';
            li.style.cursor = 'pointer';
            li.style.borderBottom = '1px solid #21252b';
            li.textContent = file.name;

            li.addEventListener('click', () => {
                this.activeFile = file;
                this.renderActiveFileView(file);
            });

            list.appendChild(li);
        });

        treeContainer.appendChild(list);
    }

    renderActiveFileView(file) {
        const viewport = document.getElementById('editor-content');
        if (file.type === 'png') {
            spriteEngine.render(file, viewport);
        } else {
            codeEditor.render(file, viewport);
        }
    }
}

const ui = new UIController();
