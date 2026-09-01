export class Settings {
  render(): HTMLElement {
    const settings = document.createElement('div');
    settings.className = 'content-grid';
    settings.textContent = '⚙️ Настройки';
    return settings;
  }
}
