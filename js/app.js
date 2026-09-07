document.addEventListener('DOMContentLoaded', async () => {
    await db.init();

    const dashboardView = document.getElementById('dashboard-view');
    const workspaceView = document.getElementById('workspace-view');
    const projectList = document.getElementById('project-list');
    const btnNewProject = document.getElementById('btn-new-project');
    const modalNewProject = document.getElementById('modal-new-project');
    const formNewProject = document.getElementById('form-new-project');
    const btnBackDashboard = document.getElementById('btn-back-dashboard');
    const exportZipBtn = document.getElementById('export-zip-btn');

    const btnAddHjson = document.getElementById('btn-add-hjson');
    const btnAddSprite = document.getElementById('btn-add-sprite');
    const btnAddScript = document.getElementById('btn-add-script');

    async function loadProjects() {
        const projects = await db.getAllProjects();
        projectList.innerHTML = '';

        if (projects.length === 0) {
            projectList.innerHTML = '<p style="color: #5c6370; grid-column: 1/-1;">No tienes proyectos aún.</p>';
            return;
        }

        projects.forEach(p => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.style.background = '#21252b';
            card.style.padding = '1rem';
            card.style.borderRadius = '6px';
            card.style.cursor = 'pointer';
            card.style.border = '1px solid #3e4451';
            card.innerHTML = `<h3>${p.name}</h3><p style="color: #abb2bf; font-size: 0.85rem;">v${p.version} - ${p.author}</p>`;

            card.addEventListener('click', () => openWorkspace(p.id, p.name));
            projectList.appendChild(card);
        });
    }

    async function openWorkspace(projectId, projectName) {
        ui.currentProjectId = projectId;
        document.getElementById('active-project-name').textContent = projectName;
        exportZipBtn.disabled = false;

        dashboardView.classList.remove('active');
        workspaceView.classList.add('active');

        await ui.loadWorkspace(projectId);
    }

    btnNewProject.addEventListener('click', () => modalNewProject.showModal());

    formNewProject.addEventListener('submit', async (e) => {
        const name = document.getElementById('mod-name').value;
        const author = document.getElementById('mod-author').value;
        const description = document.getElementById('mod-description').value;
        const version = document.getElementById('mod-version').value;

        const newProj = {
            id: 'proj_' + Date.now(),
            name,
            author,
            description,
            version,
            created: new Date().toISOString()
        };

        await db.createProject(newProj);
        modalNewProject.close();
        formNewProject.reset();
        await loadProjects();
    });

    btnBackDashboard.addEventListener('click', () => {
        ui.currentProjectId = null;
        exportZipBtn.disabled = true;
        workspaceView.classList.remove('active');
        dashboardView.classList.add('active');
        loadProjects();
    });

    exportZipBtn.addEventListener('click', async () => {
        if (ui.currentProjectId) {
            exportZipBtn.disabled = true;
            exportZipBtn.textContent = 'Compilando...';
            await zipExporter.exportProject(ui.currentProjectId);
            exportZipBtn.disabled = false;
            exportZipBtn.textContent = 'Export (.zip)';
        }
    });

    btnAddHjson.addEventListener('click', async () => {
        if (!ui.currentProjectId) return;
        const name = prompt('Nombre del bloque (ej. reactor.hjson):');
        if (!name) return;
        const fileName = name.endsWith('.hjson') ? name : `${name}.hjson`;
        const file = {
            id: `${ui.currentProjectId}_${Date.now()}`,
            projectId: ui.currentProjectId,
            name: fileName,
            path: `content/blocks/${fileName}`,
            type: 'hjson',
            content: 'type: Block\nsize: 2\ncategory: defense'
        };
        await db.saveFile(file);
        await ui.loadWorkspace(ui.currentProjectId);
    });

    btnAddSprite.addEventListener('click', async () => {
        if (!ui.currentProjectId) return;
        const name = prompt('Nombre de la imagen (ej. reactor.png):');
        if (!name) return;
        const fileName = name.endsWith('.png') ? name : `${name}.png`;
        const file = {
            id: `${ui.currentProjectId}_${Date.now()}`,
            projectId: ui.currentProjectId,
            name: fileName,
            path: `sprites/${fileName}`,
            type: 'png',
            content: ''
        };
        await db.saveFile(file);
        await ui.loadWorkspace(ui.currentProjectId);
    });

    btnAddScript.addEventListener('click', async () => {
        if (!ui.currentProjectId) return;
        const name = prompt('Nombre del script (ej. main.js):');
        if (!name) return;
        const fileName = name.endsWith('.js') ? name : `${name}.js`;
        const file = {
            id: `${ui.currentProjectId}_${Date.now()}`,
            projectId: ui.currentProjectId,
            name: fileName,
            path: `scripts/${fileName}`,
            type: 'js',
            content: '// Script de Mindustry\n'
        };
        await db.saveFile(file);
        await ui.loadWorkspace(ui.currentProjectId);
    });

    await loadProjects();
});
