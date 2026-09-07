const CodeEditor = {
  init() {
    this.editor = document.getElementById('code-editor');
    if (!this.editor) return;

    // Habilitar el uso de la tecla Tab en el textarea
    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;

        this.editor.value = this.editor.value.substring(0, start) + '  ' + this.editor.value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + 2;
      }
    });

    // Auditor de sintaxis estructural en tiempo real
    this.editor.addEventListener('input', () => {
      this.validateSyntax(this.editor.value);
    });
  },

  validateSyntax(text) {
    const statusIndicator = document.getElementById('status-indicator');
    if (!statusIndicator) return;

    try {
      const openBraces = (text.match(/{/g) || []).length;
      const closeBraces = (text.match(/}/g) || []).length;
      const openBrackets = (text.match(/\[/g) || []).length;
      const closeBrackets = (text.match(/\]/g) || []).length;

      if (openBraces !== closeBraces) {
        statusIndicator.textContent = 'Error: Llaves { } desbalanceadas';
        statusIndicator.style.color = '#d32f2f';
        return;
      }

      if (openBrackets !== closeBrackets) {
        statusIndicator.textContent = 'Error: Corchetes [ ] desbalanceados';
        statusIndicator.style.color = '#d32f2f';
        return;
      }

      statusIndicator.textContent = 'Sintaxis válida';
      statusIndicator.style.color = '#a6e22e';
    } catch (err) {
      statusIndicator.textContent = 'Error de sintaxis Hjson';
      statusIndicator.style.color = '#d32f2f';
    }
  }
};
