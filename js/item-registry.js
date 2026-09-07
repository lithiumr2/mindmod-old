const ItemRegistry = {
  // Recursos base predeterminados de Mindustry (Vanilla)
  vanillaItems: ['copper', 'lead', 'scrap', 'coal', 'beryllium', 'tungsten', 'oxide', 'carbide', 'silicon', 'metaglass', 'graphite', 'titanium', 'thorium', 'phase-fabric', 'surge-alloy'],
  vanillaLiquids: ['water', 'slag', 'oil', 'cryofluid', 'neoplasm', 'arkycite', 'ozone', 'hydrogen', 'nitrogen'],

  async getAvailableResources() {
    const files = await DB.getAllFiles();
    const customItems = [];
    const customLiquids = [];

    files.forEach(file => {
      if (file.name === 'mod.json' || file.type === 'image') return;
      const parsed = HjsonEngine.parse(file.content);
      const type = (parsed.type || '').toLowerCase();
      
      const cleanName = file.name.replace('.hjson', '');
      if (type.includes('item')) {
        customItems.push(cleanName);
      } else if (type.includes('liquid')) {
        customLiquids.push(cleanName);
      }
    });

    return {
      items: [...this.vanillaItems, ...customItems],
      liquids: [...this.vanillaLiquids, ...customLiquids]
    };
  },

  // Generador de selectores para matrices de requerimientos o consumos
  renderResourceInput(key, currentValues, container, onChange) {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '8px';
    wrapper.style.width = '100%';

    const listContainer = document.createElement('div');
    listContainer.style.display = 'flex';
    listContainer.style.flexWrap = 'wrap';
    listContainer.style.gap = '6px';

    if (!Array.isArray(currentValues)) currentValues = [];

    const updateList = async () => {
      listContainer.innerHTML = '';
      const resources = await this.getAvailableResources();
      const pool = key.toLowerCase().includes('liquid') ? resources.liquids : resources.items;

      currentValues.forEach((itemEntry, index) => {
        // Formato esperado en Mindustry: "recurso/cantidad" (ej. copper/10)
        const parts = typeof itemEntry === 'string' ? itemEntry.split('/') : [itemEntry, 1];
        const resName = parts[0] || pool[0];
        const resAmount = parts[1] || 1;

        const badge = document.createElement('div');
        badge.style.background = '#2a2a32';
        badge.style.border = '1px solid #3a3a48';
        badge.style.padding = '4px 8px';
        badge.style.borderRadius = '4px';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '6px';

        const select = document.createElement('select');
        select.className = 'input-dark';
        select.style.padding = '2px 4px';
        pool.forEach(res => {
          const opt = document.createElement('option');
          opt.value = res;
          opt.textContent = res;
          if (res === resName) opt.selected = true;
          select.appendChild(opt);
        });

        const inputAmt = document.createElement('input');
        inputAmt.type = 'number';
        inputAmt.className = 'input-dark';
        inputAmt.style.width = '60px';
        inputAmt.style.padding = '2px 4px';
        inputAmt.value = resAmount;

        select.onchange = inputAmt.oninput = () => {
          currentValues[index] = `${select.value}/${inputAmt.value}`;
          onChange(currentValues);
        };

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.style.background = '#d32f2f';
        removeBtn.style.border = 'none';
        removeBtn.style.color = 'white';
        removeBtn.style.borderRadius = '4px';
        removeBtn.style.width = '20px';
        removeBtn.style.height = '20px';
        removeBtn.style.cursor = 'pointer';

        removeBtn.onclick = () => {
          currentValues.splice(index, 1);
          updateList();
          onChange(currentValues);
        };

        badge.appendChild(select);
        badge.appendChild(inputAmt);
        badge.appendChild(removeBtn);
        listContainer.appendChild(badge);
      });
    };

    updateList();

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-secondary';
    addBtn.textContent = `+ Añadir a ${key}`;
    addBtn.onclick = async () => {
      const resources = await this.getAvailableResources();
      const pool = key.toLowerCase().includes('liquid') ? resources.liquids : resources.items;
      currentValues.push(`${pool[0]}/10`);
      await updateList();
      onChange(currentValues);
    };

    wrapper.appendChild(listContainer);
    wrapper.appendChild(addBtn);
    container.appendChild(wrapper);
  }
};
      
