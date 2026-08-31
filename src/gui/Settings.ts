export class Settings {
  render(): HTMLElement {
    const settings = document.createElement('div');
    settings.className = 'settings-content';
    settings.textContent = 'Настройки';
    return settings;
  }
}
