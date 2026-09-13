export class Settings {
    async render(targetElement) {
        if (!targetElement)
            return null;
        targetElement.innerHTML = '';
        const settings = document.createElement('div');
        settings.className = 'content-grid';
        settings.textContent = '⚙️ Настройки';
        targetElement.appendChild(settings);
        return settings;
    }
    dispose() { }
}
//# sourceMappingURL=Settings.js.map