export class ContentManager {
  getVideoContent(): HTMLElement {
    const videoGrid = document.createElement('div');
    videoGrid.className = 'content-grid';
    videoGrid.textContent = '🎬 Контент для Видео';
    return videoGrid;
  }

  getAudioContent(): HTMLElement {
    const audioGrid = document.createElement('div');
    audioGrid.className = 'content-grid';
    audioGrid.textContent = '🎵 Контент для Аудио';
    return audioGrid;
  }

  getSettingsContent(): HTMLElement {
    const settingsGrid = document.createElement('div');
    settingsGrid.className = 'content-grid';
    settingsGrid.textContent = '⚙️ Контент для Настроек';
    return settingsGrid;
  }
}
