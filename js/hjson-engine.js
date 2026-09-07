const HjsonEngine = {
  // Convierte el objeto de memoria en texto Hjson limpio para Mindustry
  stringify(obj) {
    if (!obj || Object.keys(obj).length === 0) return '';
    
    let lines = [];
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        lines.push(`${key}: [`);
        value.forEach(item => lines.push(`  ${item}`));
        lines.push(`]`);
      } else if (typeof value === 'object') {
        lines.push(`${key}: {`);
        // Soporte básico de un nivel de anidación
        for (const [subKey, subVal] of Object.entries(value)) {
          lines.push(`  ${subKey}: ${subVal}`);
        }
        lines.push(`}`);
      } else if (typeof value === 'string' && value.includes(' ')) {
        lines.push(`${key}: "${value}"`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
    return lines.join('\n');
  },

  // Analizador básico de recuperación (Convierte texto Hjson a Objeto JS)
  parse(text) {
    if (!text.trim()) return {};
    let obj = {};
    const lines = text.split('\n');
    
    // Lógica simplificada: lee líneas clave: valor
    // Nota: Para un soporte total en el futuro importaremos la librería nativa de Hjson
    lines.forEach(line => {
      const match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(.+)$/);
      if (match) {
        let key = match[1];
        let val = match[2].replace(/["']/g, '').trim(); // Quita comillas
        if (!isNaN(val)) val = Number(val); // Convierte a número si es posible
        else if (val === 'true') val = true;
        else if (val === 'false') val = false;
        obj[key] = val;
      }
    });
    return obj;
  }
};
