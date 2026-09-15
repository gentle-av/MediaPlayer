export class ConfirmModal {
  private container: HTMLElement | null = null;

  public show(
    title: string,
    message: string,
    isDanger: boolean = false,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.container = document.createElement('div');
      this.container.className = 'confirm-modal dynamic-confirm-modal-overlay';
      const dialog = document.createElement('div');
      dialog.className = 'confirm-dialog dynamic-confirm-dialog-panel';
      const header = document.createElement('h3');
      header.className = isDanger
        ? 'dynamic-confirm-header-danger'
        : 'dynamic-confirm-header-warning';
      header.textContent = title;
      const body = document.createElement('p');
      body.className = 'dynamic-confirm-body-text';
      body.textContent = message;
      const footer = document.createElement('div');
      footer.className = 'dynamic-confirm-footer-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'confirm-btn-cancel dynamic-confirm-btn-cancel';
      cancelBtn.textContent = 'Отмена';
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'confirm-btn-confirm dynamic-confirm-btn-confirm';
      confirmBtn.style.setProperty(
        '--confirm-btn-bg',
        isDanger ? 'var(--red)' : 'var(--yellow)',
      );
      confirmBtn.style.setProperty(
        '--confirm-btn-hover-bg',
        isDanger ? '#ff6b5a' : 'var(--orange)',
      );
      confirmBtn.textContent = 'Удалить';
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
