const ModValidator = {
  async auditProject() {
    const files = await DB.getAllFiles();
    const errors = [];
    const warnings = [];

    const modJson = files.find(f => f.name === 'mod.json');
    if (!modJson) {
      errors.push("Falta el archivo crítico 'mod.json'. El mod no se cargará correctamente en Mindustry.");
    } else {
      const parsedMod = HjsonEngine.parse(modJson.content);
      if (!parsedMod.name) warnings.push("El archivo 'mod.json' no define un nombre ('name').");
      if (!parsedMod.version) warnings.push("El archivo 'mod.json' no especifica una versión.");
    }

    const resources = await ItemRegistry.getAvailableResources();
    const allFileNames = files.map(f => f.name);

    for (const file of files) {
      if (file.name === 'mod.json' || file.type === 'image') continue;
      const parsed = HjsonEngine.parse(file.content);
      const cleanName = file.name.replace('.hjson', '');

      // Verificar existencia de sprite vinculado
      const spritePath = `sprites/${cleanName}.png`;
      const hasSprite = allFileNames.includes(spritePath);
      if (!hasSprite) {
        warnings.push(`El elemento '${cleanName}' no tiene un sprite PNG vinculado en la carpeta sprites/.`);
      }

      // Verificar validez de requisitos de construcción
      if (parsed.requirements && Array.isArray(parsed.requirements)) {
        parsed.requirements.forEach(req => {
          const [item] = req.split('/');
          if (!resources.items.includes(item)) {
            errors.push(`El bloque '${cleanName}' requiere un recurso desconocido o inexistente: '${item}'.`);
          }
        });
      }

      // Verificar torretas sin proyectil definido
      const type = (parsed.type || '').toLowerCase();
      if (type.includes('turret') && !parsed.bullet) {
        errors.push(`La torreta '${cleanName}' no tiene configurado ningún objeto de proyectil ('bullet').`);
      }
    }

    return { errors, warnings };
  },

  async showAuditModal() {
    const { errors, warnings } = await this.auditProject();
    
    let report = '=== REPORTE DE AUDITORÍA DEL MOD ===\n\n';
    if (errors.length === 0 && warnings.length === 0) {
      report += '¡Excelente! No se detectaron errores estructurales ni advertencias en tu mod.';
    } else {
      if (errors.length > 0) {
        report += `❌ ERRORES CRÍTICOS (${errors.length}):\n` + errors.map(e => `• ${e}`).join('\n') + '\n\n';
      }
      if (warnings.length > 0) {
        report += `⚠️ ADVERTENCIAS (${warnings.length}):\n` + warnings.map(w => `• ${w}`).join('\n') + '\n';
      }
    }
    alert(report);
  }
};
