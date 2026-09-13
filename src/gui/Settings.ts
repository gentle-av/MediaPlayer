import { Component } from './components/Component.js';

export class Settings implements Component {
  public async render(
    targetElement: HTMLElement | null,
  ): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    targetElement.innerHTML = '';
    const settings = document.createElement('div');
    settings.className = 'content-grid';
    settings.textContent = '⚙️ Настройки';
    targetElement.appendChild(settings);
    return settings;
  }

  public dispose(): void {}
}
