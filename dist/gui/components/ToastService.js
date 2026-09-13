export class ToastService {
    constructor() {
        this.containerElement = null;
        this.createContainer();
    }
    static getInstance() {
        if (!ToastService.instance) {
            ToastService.instance = new ToastService();
        }
        return ToastService.instance;
    }
    show(message, type = 'info') {
        if (!this.containerElement)
            this.createContainer();
        const toast = document.createElement('div');
        toast.className = `notification ${type}`;
        toast.style.animation = 'slideIn 0.3s ease forwards';
        const icon = this.getIconSvg(type);
        toast.innerHTML = `${icon}<span>${message}</span>`;
        this.containerElement?.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }
    createContainer() {
        this.containerElement = document.createElement('div');
        this.containerElement.className = 'toast-container';
        Object.assign(this.containerElement.style, {
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: '10050',
            pointerEvents: 'none',
        });
        document.body.appendChild(this.containerElement);
    }
    getIconSvg(type) {
        if (type === 'success') {
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
        stroke-linejoin="round" style="margin-right: 8px; flex-shrink: 0;">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>`;
        }
        if (type === 'error') {
            return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
        stroke-linejoin="round" style="margin-right: 8px; flex-shrink: 0;">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`;
        }
        return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
      stroke-linejoin="round" style="margin-right: 8px; flex-shrink: 0;">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`;
    }
}
ToastService.instance = null;
//# sourceMappingURL=ToastService.js.map