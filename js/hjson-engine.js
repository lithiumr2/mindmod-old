  parse(text) {
    if (!text.trim()) return {};
    let obj = {};
    const lines = text.split('\n');
    let currentKey = null;
    let currentContainer = obj;
    let inArray = false;
    let arrayHolder = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;

      // Detectar inicio de array o bloque anidado
      if (trimmed.endsWith(': [')) {
        currentKey = trimmed.replace(': [', '').trim();
        arrayHolder = [];
        inArray = 'array';
        return;
      } else if (trimmed.endsWith(': {')) {
        currentKey = trimmed.replace(': {', '').trim();
        obj[currentKey] = {};
        return;
      } else if (trimmed === ']' || trimmed === '}') {
        if (inArray === 'array' && currentKey) {
          obj[currentKey] = arrayHolder;
        }
        currentKey = null;
        inArray = false;
        return;
      }

      if (inArray === 'array') {
        let val = trimmed.replace(/["',]/g, '').trim();
        if (val) arrayHolder.push(val);
        return;
      }

      // Línea clave: valor normal
      const match = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*(.+)$/);
      if (match) {
        let key = match[1];
        let val = match[2].replace(/["']/g, '').trim();
        if (!isNaN(val)) val = Number(val);
        else if (val === 'true') val = true;
        else if (val === 'false') val = false;
        obj[key] = val;
      }
    });
    return obj;
  }
