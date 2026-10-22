import { BookStore } from '../../core/store/BookStore.js';
import { Component } from '../components/Component.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';
import { BookReaderModal } from '../reader/BookReaderModal.js';
import { AuthorInfoModal } from '../modals/AuthorInfoModal.js';
import { BookCard } from '../components/BookCard.js';

export class BooksContentContainer implements Component {
  private readonly reader: BookReaderModal;
  private readonly authorModal: AuthorInfoModal;
  private activeCards: BookCard[] = [];
  private rootElement: HTMLElement | null = null;

  constructor(private readonly bookStore: BookStore) {
    this.reader = new BookReaderModal(this.bookStore);
    this.authorModal = new AuthorInfoModal(this.bookStore, this.reader);
  }

  public async render(targetElement: HTMLElement | null): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    this.dispose();
    targetElement.innerHTML = '';
    const uiState = UiStateStore.getInstance().getState();
    const filterTerm = uiState.searchQuery;
    const activePath = uiState.currentBookPath || '/mnt/books';
    if (!this.bookStore.isLoaded() || this.bookStore.getCurrentPath() !== activePath) {
      await this.bookStore.loadLibrary(activePath);
    }
    const allAuthors = await this.bookStore.loadAuthors();
    this.rootElement = document.createElement('div');
    this.rootElement.className = 'books-tab-root';
    let filteredAuthors = allAuthors;
    let allItems = this.bookStore.getItems();
    if (filterTerm) {
      const lowerTerm = filterTerm.toLowerCase().trim();
      filteredAuthors = allAuthors.filter((a) => a.author.toLowerCase().includes(lowerTerm));
      allItems = this.bookStore.search(filterTerm);
    }
    if (filteredAuthors.length === 0 && allItems.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'books-global-empty-state';
      emptyDiv.textContent = filterTerm ? '📚 Ничего не найдено' : '📚 Папка пуста';
      this.rootElement.appendChild(emptyDiv);
      targetElement.appendChild(this.rootElement);
      return this.rootElement;
    }
    const gridElement = document.createElement('div');
    gridElement.className = 'books-unified-grid';
    filteredAuthors.forEach((authorItem) => {
      const authorCard = document.createElement('div');
      authorCard.className = 'books-card author-special-card';
      const coverWrap = document.createElement('div');
      coverWrap.className = 'books-card-cover';
      coverWrap.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
      const caption = document.createElement('figcaption');
      caption.className = 'books-card-caption';
      caption.innerHTML = `<strong>${authorItem.author}</strong><br><span style="color: var(--fg4); font-size: 0.75rem;">${authorItem.count} кн.</span>`;
      authorCard.append(coverWrap, caption);
      authorCard.addEventListener('click', async () => {
        await this.authorModal.open(authorItem.author);
      });
      gridElement.appendChild(authorCard);
    });
    allItems.forEach((item) => {
      const bookCard = new BookCard(item, this.bookStore);
      const cardElement = bookCard.render();
      this.activeCards.push(bookCard);
      cardElement.addEventListener('click', async (e) => {
        e.preventDefault();
        if (item.isDirectory) {
          UiStateStore.getInstance().setBookPath(item.path);
        } else if (item.isBook) {
          await this.reader.open(item);
        }
      });
      gridElement.appendChild(cardElement);
    });
    this.rootElement.appendChild(gridElement);
    targetElement.appendChild(this.rootElement);
    return this.rootElement;
  }

  public dispose(): void {
    if (this.rootElement && this.rootElement.parentNode) {
      this.rootElement.parentNode.removeChild(this.rootElement);
    }
    this.activeCards.forEach((card) => card.dispose());
    this.activeCards = [];
    this.reader.close();
    this.authorModal.close();
    this.rootElement = null;
  }
}
