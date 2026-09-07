const BlockTemplates = {
  templates: {
    wall: {
      type: "Wall",
      health: 500,
      size: 1,
      requirements: ["copper/6"],
      category: "defense"
    },
    drill: {
      type: "Drill",
      tier: 2,
      drillTime: 300,
      size: 2,
      requirements: ["copper/12", "lead/8"],
      category: "production"
    },
    turret: {
      type: "ItemTurret",
      health: 800,
      size: 2,
      reload: 20,
      range: 160,
      shootSound: "pew",
      requirements: ["copper/35", "lead/20"],
      category: "turret"
    },
    factory: {
      type: "GenericCrafter",
      health: 200,
      size: 2,
      craftTime: 40,
      requirements: ["lead/50", "silicon/30"],
      category: "crafting"
    }
  },

  renderTemplateSelector(container, onSelectCallback) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '10px';
    wrapper.style.marginBottom = '15px';
    wrapper.style.alignItems = 'center';
    wrapper.style.background = '#25252b';
    wrapper.style.padding = '10px';
    wrapper.style.borderRadius = '6px';

    const label = document.createElement('span');
    label.textContent = 'Plantilla rápida:';
    label.style.color = '#a0a0b0';
    label.style.fontWeight = 'bold';

    const select = document.createElement('select');
    select.className = 'input-dark';
    select.style.flex = '1';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '-- Cargar estructura base --';
    select.appendChild(defaultOpt);

    Object.keys(this.templates).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      select.appendChild(opt);
    });

    const applyBtn = document.createElement('button');
    applyBtn.className = 'btn-secondary';
    applyBtn.textContent = 'Aplicar';
    applyBtn.onclick = () => {
      const selected = select.value;
      if (selected && this.templates[selected]) {
        const clone = JSON.parse(JSON.stringify(this.templates[selected]));
        onSelectCallback(clone);
      }
    };

    wrapper.appendChild(label);
    wrapper.appendChild(select);
    wrapper.appendChild(applyBtn);
    container.prepend(wrapper);
  }
};
