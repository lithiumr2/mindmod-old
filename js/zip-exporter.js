class ZipExporter {
    async exportProject(projectId) {
        if (!projectId) {
            alert('No hay proyecto activo para exportar.');
            return;
        }

        if (typeof JSZip === 'undefined') {
            alert('JSZip no está cargado.');
            return;
        }

        try {
            const zip = new JSZip();
            const files = await db.getProjectFiles(projectId);

            if (!files || files.length === 0) {
                alert('El proyecto no tiene archivos para exportar.');
                return;
            }

            const projects = await db.getAllProjects();
            const currentProject = projects.find(p => p.id === projectId);
            const rawName = currentProject ? currentProject.name : 'mindustry-mod';
            const zipFilename = `${rawName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.zip`;

            files.forEach(file => {
                if (file.type === 'png') {
                    const base64Data = file.content.replace(/^data:image\/(png|jpg);base64,/, '');
                    zip.file(file.path, base64Data, { base64: true });
                } else {
                    zip.file(file.path, file.content || '');
                }
            });

            const blob = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(blob, zipFilename);

        } catch (error) {
            console.error('Export Error:', error);
            alert(`Error al generar el ZIP:\n${error.message}`);
        }
    }

    downloadBlob(blob, filename) {
        const downloadUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        setTimeout(() => {
            document.body.removeChild(anchor);
            URL.revokeObjectURL(downloadUrl);
        }, 100);
    }
}

const zipExporter = new ZipExporter();
