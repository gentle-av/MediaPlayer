import { UiStateStore } from '../../core/store/UiStateStore.js';
import { BookReaderModal } from '../reader/BookReaderModal.js';
export class BooksContentContainer {
    constructor(bookStore) {
        this.bookStore = bookStore;
        this.reader = new BookReaderModal(this.bookStore);
    }
    async render(targetElement) {
        if (!targetElement)
            return null;
        const uiState = UiStateStore.getInstance().getState();
        const filterTerm = uiState.searchQuery;
        const activePath = uiState.currentBookPath || '/mnt/books';
        if (!this.bookStore.isLoaded() ||
            this.bookStore.getCurrentPath() !== activePath) {
            await this.bookStore.loadLibrary(activePath);
        }
        while (targetElement.firstChild) {
            targetElement.removeChild(targetElement.firstChild);
        }
        let allItems = this.bookStore.getItems();
        if (filterTerm) {
            allItems = this.bookStore.search(filterTerm);
        }
        if (allItems.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'books-empty-state';
            emptyDiv.textContent = '📚 Папка пуста';
            targetElement.appendChild(emptyDiv);
            return null;
        }
        const gridElement = document.createElement('div');
        gridElement.className = 'books-grid';
        allItems.forEach((item) => {
            const card = this.createBookCardElement(item);
            card.addEventListener('click', async (e) => {
                e.preventDefault();
                if (item.isDirectory) {
                    UiStateStore.getInstance().setBookPath(item.path);
                }
                else if (item.isBook) {
                    await this.reader.open(item);
                }
            });
            gridElement.appendChild(card);
        });
        targetElement.appendChild(gridElement);
        return gridElement;
    }
    dispose() {
        this.reader.close();
    }
    createBookCardElement(item) {
        const cardElement = document.createElement('figure');
        cardElement.className = 'books-card';
        const iconContainer = document.createElement('div');
        iconContainer.className = 'books-card-icon';
        if (item.isDirectory) {
            iconContainer.classList.add('books-card-icon-folder');
        }
        else if (item.isBook) {
            iconContainer.classList.add('books-card-icon-book');
        }
        else {
            iconContainer.classList.add('books-card-icon-file');
        }
        const caption = document.createElement('figcaption');
        caption.className = 'books-card-caption';
        caption.textContent = item.name;
        cardElement.append(iconContainer, caption);
        return cardElement;
    }
}
//# sourceMappingURL=BooksContentContainer.js.map