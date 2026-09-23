export class PlaylistClearConfirmModal {
  private container: HTMLElement | null = null;

  public show(): Promise<boolean> {
    return new Promise((resolve) => {
      const existing = document.querySelector('.dynamic-confirm-modal-overlay');
      if (existing) {
        resolve(false);
        return;
      }
      this.container = document.createElement('div');
      this.container.className = 'dynamic-confirm-modal-overlay';
      const dialog = document.createElement('div');
      dialog.className = 'dynamic-confirm-dialog-panel';
      const header = document.createElement('h3');
      header.className = 'dynamic-confirm-header-danger';
      header.textContent = 'Очистка плейлиста';
      const body = document.createElement('p');
      body.className = 'dynamic-confirm-body-text';
      body.textContent = 'Очистить текущий список воспроизведения?';
      const footer = document.createElement('div');
      footer.className = 'dynamic-confirm-footer-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'dynamic-confirm-btn-cancel';
      cancelBtn.textContent = 'Отмена';
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'dynamic-confirm-btn-confirm';
      confirmBtn.style.setProperty('--confirm-btn-bg', 'var(--red)');
      confirmBtn.style.setProperty('--confirm-btn-hover-bg', '#ff6b5a');
      confirmBtn.textContent = 'Очистить';
      cancelBtn.addEventListener('click', () => {
        this.close();
        resolve(false);
      });
      confirmBtn.addEventListener('click', () => {
        this.close();
        resolve(true);
      });
      footer.append(cancelBtn, confirmBtn);
      dialog.append(header, body, footer);
      this.container.appendChild(dialog);
      document.body.appendChild(this.container);
    });
  }

  private close(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}
