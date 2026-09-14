import { ContextMenu } from './ContextMenu.js';
import { RefreshManagerModal } from '../modals/RefreshManagerModal.js';
export class MusicBackgroundMenu {
    constructor(musicStore) {
        this.musicStore = musicStore;
        this.contextMenu = new ContextMenu();
    }
    bind(element, siblingMenu) {
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
    close() {
        this.contextMenu.close();
    }
}
//# sourceMappingURL=MusicBackgroundMenu.js.map