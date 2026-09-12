export interface ContextMenuItem {
  label: string;
  action: () => void | Promise<void>;
  isDanger?: boolean;
}

export class ContextMenu {
  private element: HTMLElement | null = null;
  private currentEvent: MouseEvent | null = null;

  constructor() {
    this.close = this.close.bind(this);
    window.addEventListener('click', this.close);
    window.addEventListener('resize', this.close);
  }

  public show(e: MouseEvent, items: ContextMenuItem[]): void {
    e.preventDefault();
    e.stopPropagation();
    this.currentEvent = e;
    this.close();
    this.element = document.createElement('div');
    this.element.className = 'context-menu';
    Object.assign(this.element.style, {
      position: 'fixed',
      zIndex: '10005',
      background: 'var(--bg1)',
      border: '1px solid var(--bg3)',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden',
      minWidth: '180px',
    });
    items.forEach((item) => {
      const itemElement = document.createElement('div');
      itemElement.className = item.isDanger
        ? 'context-menu-item danger'
        : 'context-menu-item';
      itemElement.textContent = item.label;
      Object.assign(itemElement.style, {
        padding: '10px 16px',
        cursor: 'pointer',
        color: item.isDanger ? 'var(--red)' : 'var(--fg1)',
        fontSize: '0.85rem',
        transition: 'all 0.15s ease',
      });
      itemElement.addEventListener('mouseenter', () => {
        itemElement.style.background = item.isDanger
          ? 'rgba(251, 73, 52, 0.15)'
          : 'var(--bg2)';
      });
      itemElement.addEventListener('mouseleave', () => {
        itemElement.style.background = 'transparent';
      });
      itemElement.addEventListener('click', async (clickEvent) => {
        clickEvent.stopPropagation();
        this.close();
        await item.action();
      });
      this.element!.appendChild(itemElement);
    });
    document.body.appendChild(this.element);
    this.positionMenu(e.clientX, e.clientY);
  }

  private positionMenu(x: number, y: number): void {
    if (!this.element) return;
    const rect = this.element.getBoundingClientRect();
    const adjustedX =
      x + rect.width > window.innerWidth
        ? window.innerWidth - rect.width - 8
        : x;
    const adjustedY =
      y + rect.height > window.innerHeight
        ? window.innerHeight - rect.height - 8
        : y;
    this.element.style.left = `${Math.max(0, adjustedX)}px`;
    this.element.style.top = `${Math.max(0, adjustedY)}px`;
  }

  public close(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.currentEvent = null;
  }
}
