const ModManager = {
  renderModJsonForm(container, data, onChangeCallback) {
    container.innerHTML = '';
    
    const fields = [
      { key: 'name', label: 'Nombre del Mod', type: 'text' },
      { key: 'author', label: 'Autor', type: 'text' },
      { key: 'description', label: 'Descripción', type: 'text' },
      { key: 'version', label: 'Versión', type: 'text' },
      { key: 'minGameVersion', label: 'Versión Mínima de Mindustry (ej. 146)', type: 'number' },
      { key: 'hidden', label: '¿Mod Oculto?', type: 'checkbox' }
    ];

    fields.forEach(field => {
      const row = document.createElement('div');
      row.className = 'prop-row';
      row.style.display = 'flex';
      row.style.gap = '10px';
      row.style.marginBottom = '12px';
      row.style.alignItems = 'center';

      const label = document.createElement('label');
      label.textContent = field.label + ':';
      label.style.width = '180px';
      label.style.color = '#a0a0b0';

      let input;
      if (field.type === 'checkbox') {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = Boolean(data[field.key]);
        input.addEventListener('change', (e) => {
          data[field.key] = e.target.checked;
          onChangeCallback(data);
        });
      } else {
        input = document.createElement('input');
        input.className = 'input-dark';
        input.style.flex = '1';
        input.type = field.type;
        input.value = data[field.key] !== undefined ? data[field.key] : '';
        input.addEventListener('input', (e) => {
          let val = e.target.value;
          if (field.type === 'number' && val !== '') val = Number(val);
          data[field.key] = val;
          onChangeCallback(data);
        });
      }

      row.appendChild(label);
      row.appendChild(input);
      container.appendChild(row);
    });

    // Sección especial para Dependencias (Librerías como multilib)
    const depRow = document.createElement('div');
    depRow.className = 'prop-row';
    depRow.style.display = 'flex';
    depRow.style.flexDirection = 'column';
    depRow.style.gap = '8px';
    depRow.style.marginBottom = '12px';
    depRow.style.background = '#222228';
    depRow.style.padding = '10px';
    depRow.style.borderRadius = '6px';

    const depLabel = document.createElement('label');
    depLabel.textContent = 'Dependencias / Librerías (ej. multilib):';
    depLabel.style.color = '#fbc02d';
    depLabel.style.fontWeight = 'bold';

    const depList = document.createElement('div');
    depList.style.display = 'flex';
    depList.style.flexWrap = 'wrap';
    depList.style.gap = '5px';

    if (!Array.isArray(data.dependencies)) data.dependencies = [];

    const renderDeps = () => {
      depList.innerHTML = '';
      data.dependencies.forEach((dep, index) => {
        const badge = document.createElement('span');
        badge.style.background = '#303038';
        badge.style.padding = '4px 8px';
        badge.style.borderRadius = '4px';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '6px';
        badge.textContent = dep;

        const removeDepBtn = document.createElement('button');
        removeDepBtn.textContent = '✕';
        removeDepBtn.style.background = '#d32f2f';
        removeDepBtn.style.border = 'none';
        removeDepBtn.style.color = 'white';
        removeDepBtn.style.borderRadius = '50%';
        removeDepBtn.style.width = '16px';
        removeDepBtn.style.height = '16px';
        removeDepBtn.style.fontSize = '10px';
        removeDepBtn.style.cursor = 'pointer';

        removeDepBtn.onclick = () => {
          data.dependencies.splice(index, 1);
          renderDeps();
          onChangeCallback(data);
        };

        badge.appendChild(removeDepBtn);
        depList.appendChild(badge);
      });
    };
    renderDeps();

    const addDepContainer = document.createElement('div');
    addDepContainer.style.display = 'flex';
    addDepContainer.style.gap = '10px';
    addDepContainer.style.marginTop = '5px';

    const depInput = document.createElement('input');
    depInput.className = 'input-dark';
    depInput.style.flex = '1';
    depInput.placeholder = 'Nombre del mod o librería (ej. multilib)';

    const addDepBtn = document.createElement('button');
    addDepBtn.className = 'btn-secondary';
    addDepBtn.textContent = '+ Añadir Dependencia';
    addDepBtn.onclick = () => {
      const val = depInput.value.trim();
      if (val && !data.dependencies.includes(val)) {
        data.dependencies.push(val);
        depInput.value = '';
        renderDeps();
        onChangeCallback(data);
      }
    };

    addDepContainer.appendChild(depInput);
    addDepContainer.appendChild(addDepBtn);

    depRow.appendChild(depLabel);
    depRow.appendChild(depList);
    depRow.appendChild(addDepContainer);
    container.appendChild(depRow);
  }
};
  
