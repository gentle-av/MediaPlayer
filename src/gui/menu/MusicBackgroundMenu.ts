import { MusicStore } from '../../core/store/MusicStore.js';
import { ContextMenu } from './ContextMenu.js';
import { RefreshManagerModal } from '../modals/RefreshManagerModal.js';

export class MusicBackgroundMenu {
  private readonly contextMenu: ContextMenu;

  constructor(private readonly musicStore: MusicStore) {
    this.contextMenu = new ContextMenu();
  }

  public bind(element: HTMLElement, siblingMenu?: ContextMenu): void {
    element.addEventListener('contextmenu', (e) => {
      if (e.target === element) {
        e.preventDefault();
        e.stopPropagation();
        if (siblingMenu) {
          siblingMenu.close();
        }
        this.contextMenu.show(e, [
          {
            label: 'Обновить',
            action: () => {
              const refreshModal = new RefreshManagerModal(this.musicStore);
              refreshModal.open();
            },
          },
        ]);
      }
    });
  }

  public close(): void {
    this.contextMenu.close();
  }
}
