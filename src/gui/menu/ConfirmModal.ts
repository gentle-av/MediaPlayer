export class ConfirmModal {
  private container: HTMLElement | null = null;

  public show(
    title: string,
    message: string,
    isDanger: boolean = false,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.container = document.createElement('div');
      this.container.className = 'confirm-modal';
      Object.assign(this.container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '10015',
        animation: 'fadeIn 0.2s ease',
      });
      const dialog = document.createElement('div');
      dialog.className = 'confirm-dialog';
      Object.assign(dialog.style, {
        background: 'var(--bg1)',
        borderRadius: '16px',
        padding: '24px',
        minWidth: '320px',
        maxWidth: '480px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--bg3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      });
      const header = document.createElement('h3');
      header.textContent = title;
      Object.assign(header.style, {
        margin: '0',
        fontSize: '1.2rem',
        fontWeight: '600',
        color: isDanger ? 'var(--red)' : 'var(--yellow)',
      });
      const body = document.createElement('p');
      body.textContent = message;
      Object.assign(body.style, {
        margin: '0',
        fontSize: '0.95rem',
        lineHeight: '1.5',
        color: 'var(--fg1)',
      });
      const footer = document.createElement('div');
      Object.assign(footer.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '8px',
      });
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'confirm-btn-cancel';
      cancelBtn.textContent = 'Отмена';
      Object.assign(cancelBtn.style, {
        padding: '10px 20px',
        border: '1px solid var(--bg3)',
        borderRadius: '8px',
        background: 'var(--bg2)',
        color: 'var(--fg2)',
        fontSize: '0.9rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      });
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'confirm-btn-confirm';
      confirmBtn.textContent = 'Удалить';
      Object.assign(confirmBtn.style, {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        background: isDanger ? 'var(--red)' : 'var(--yellow)',
        color: 'var(--bg0)',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      });
      cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = 'var(--bg3)';
        cancelBtn.style.color = 'var(--fg0)';
      });
      cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'var(--bg2)';
        cancelBtn.style.color = 'var(--fg2)';
      });
      confirmBtn.addEventListener('mouseenter', () => {
        confirmBtn.style.background = isDanger ? '#ff6b5a' : 'var(--orange)';
      });
      confirmBtn.addEventListener('mouseleave', () => {
        confirmBtn.style.background = isDanger ? 'var(--red)' : 'var(--yellow)';
      });
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
