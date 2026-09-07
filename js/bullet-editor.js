const BulletEditor = {
  renderBulletSection(container, currentData, onChangeCallback) {
    // Si el bloque actual es una torreta o soporta proyectiles, inicializamos el objeto bullet
    if (!currentData.bullet || typeof currentData.bullet !== 'object') {
      currentData.bullet = { type: "BasicBulletType", damage: 25, speed: 4, lifetime: 60 };
    }

    const wrapper = document.createElement('div');
    wrapper.style.background = '#222228';
    wrapper.style.padding = '14px';
    wrapper.style.borderRadius = '6px';
    wrapper.style.marginTop = '15px';
    wrapper.style.border = '1px solid #3a3a48';

    const title = document.createElement('h4');
    title.textContent = '⚙️ Configuración del Proyectil (Bullet)';
    title.style.color = '#fbc02d';
    title.style.marginBottom = '12px';
    title.style.marginTop = '0';
    wrapper.appendChild(title);

    const bulletFields = [
      { key: 'type', label: 'Tipo de Proyectil', type: 'select', options: ['BasicBulletType', 'ArtilleryBulletType', 'LaserBulletType', 'FlakBulletType', 'PowerBulletType'] },
      { key: 'damage', label: 'Daño', type: 'number' },
      { key: 'speed', label: 'Velocidad de Vuelo', type: 'number' },
      { key: 'lifetime', label: 'Duración (Ticks)', type: 'number' },
      { key: 'knockback', label: 'Retroceso (Knockback)', type: 'number' },
      { key: 'splashDamage', label: 'Daño de Área (Splash)', type: 'number' },
      { key: 'splashDamageRadius', label: 'Radio de Área (Tiles)', type: 'number' }
    ];

    bulletFields.forEach(field => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '10px';
      row.style.marginBottom = '8px';
      row.style.alignItems = 'center';

      const label = document.createElement('label');
      label.textContent = field.label + ':';
      label.style.width = '170px';
      label.style.color = '#a0a0b0';
      label.style.fontSize = '13px';

      let input;
      if (field.type === 'select') {
        input = document.createElement('select');
        input.className = 'input-dark';
        input.style.flex = '1';
        field.options.forEach(optVal => {
          const opt = document.createElement('option');
          opt.value = optVal;
          opt.textContent = optVal;
          if (currentData.bullet[field.key] === optVal) opt.selected = true;
          input.appendChild(opt);
        });
        input.onchange = (e) => {
          currentData.bullet[field.key] = e.target.value;
          onChangeCallback(currentData);
        };
      } else {
        input = document.createElement('input');
        input.className = 'input-dark';
        input.style.flex = '1';
        input.type = 'number';
        input.value = currentData.bullet[field.key] !== undefined ? currentData.bullet[field.key] : '';
        input.oninput = (e) => {
          let val = e.target.value;
          if (val !== '') val = Number(val);
          currentData.bullet[field.key] = val;
          onChangeCallback(currentData);
        };
      }

      row.appendChild(label);
      row.appendChild(input);
      wrapper.appendChild(row);
    });

    container.appendChild(wrapper);
  }
};
