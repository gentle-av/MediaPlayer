import { BookStore } from '../../core/store/BookStore.js';
import { BookAuthor } from '../../core/api/BookApiClient.js';
import { Component } from '../components/Component.js';
import { UiStateStore } from '../../core/store/UiStateStore.js';
import { BookReaderModal } from '../reader/BookReaderModal.js';
import { AuthorInfoModal } from '../modals/AuthorInfoModal.js';
import { BookCard } from '../components/BookCard.js';

export class BooksContentContainer implements Component {
  private readonly reader: BookReaderModal;
  private readonly authorModal: AuthorInfoModal;
  private authors: BookAuthor[] = [];
  private authorsLoaded = false;
  private activeAuthorFilter: string | null = null;
  private rootElement: HTMLElement | null = null;
  private authorsSectionElement: HTMLElement | null = null;
  private gridHostElement: HTMLElement | null = null;
  private activeCards: BookCard[] = [];

  constructor(private readonly bookStore: BookStore) {
    this.reader = new BookReaderModal(this.bookStore);
    this.authorModal = new AuthorInfoModal(this.bookStore, this.reader);
  }

  public async render(
    targetElement: HTMLElement | null,
  ): Promise<HTMLElement | null> {
    if (!targetElement) return null;
    targetElement.innerHTML = '';
    this.rootElement = document.createElement('div');
    this.rootElement.className = 'books-tab-root';
    this.authorsSectionElement = document.createElement('div');
    this.authorsSectionElement.className = 'books-authors-host';
    this.gridHostElement = document.createElement('div');
    this.gridHostElement.className = 'books-grid-host';
    this.rootElement.append(
      this.authorsSectionElement,
      this.gridHostElement,
    );
    targetElement.appendChild(this.rootElement);
    await this.reloadData();
    return this.rootElement;
  }

  public dispose(): void {
    this.activeCards.forEach((card) => card.dispose());
    this.activeCards = [];
    this.reader.close();
    this.authorModal.close();
    this.authors = [];
    this.authorsLoaded = false;
    this.activeAuthorFilter = null;
    this.rootElement = null;
    this.authorsSectionElement = null;
    this.gridHostElement = null;
  }

  private async reloadData(): Promise<void> {
    if (!this.gridHostElement || !this.authorsSectionElement) return;
    const uiState = UiStateStore.getInstance().getState();
    const filterTerm = uiState.searchQuery;
    const activePath = uiState.currentBookPath || '/mnt/books';
    try {
      if (
        !this.bookStore.isLoaded() ||
        this.bookStore.getCurrentPath() !== activePath
      ) {
        await this.bookStore.loadLibrary(activePath);
      }
      if (!this.authorsLoaded) {
        this.authors = await this.bookStore.loadAuthors();
        this.authorsLoaded = true;
      }
    } catch (error) {
      console.error('❌ [BooksContentContainer] load error:', error);
    }
    this.renderAuthors(filterTerm);
    this.renderBooks(filterTerm);
  }

  private renderAuthors(filterTerm: string): void {
    if (!this.authorsSectionElement) return;
    this.authorsSectionElement.innerHTML = '';
    const section = document.createElement('div');
    section.className = 'books-authors-section';
    const header = document.createElement('div');
    header.className = 'books-authors-header';
    const title = document.createElement('div');
    title.className = 'books-authors-title';
    title.textContent = `Авторы (${this.authors.length})`;
    header.appendChild(title);
    if (this.activeAuthorFilter) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'books-authors-reset-btn';
      resetBtn.textContent = 'Сбросить';
      resetBtn.addEventListener('click', () => {
        this.activeAuthorFilter = null;
        void this.reloadData();
      });
      header.appendChild(resetBtn);
    }
    section.appendChild(header);
    if (this.authors.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'books-authors-empty';
      empty.textContent = 'Авторы не найдены';
      section.appendChild(empty);
      this.authorsSectionElement.appendChild(section);
      return;
    }
    const filterLower = (filterTerm || '').toLowerCase().trim();
    const visibleAuthors = filterLower
      ? this.authors.filter((a) =>
          a.author.toLowerCase().includes(filterLower),
        )
      : this.authors;
    if (visibleAuthors.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'books-authors-empty';
      empty.textContent = 'Нет авторов по запросу';
      section.appendChild(empty);
      this.authorsSectionElement.appendChild(section);
      return;
    }
    const chips = document.createElement('div');
    chips.className = 'books-authors-chips';
    visibleAuthors.forEach((authorItem) => {
      const chip = document.createElement('button');
      chip.className = 'books-author-chip';
      if (this.activeAuthorFilter === authorItem.author) {
        chip.classList.add('active');
      }
      const nameSpan = document.createElement('span');
      nameSpan.className = 'books-author-chip-name';
      nameSpan.textContent = authorItem.author;
      const countSpan = document.createElement('span');
      countSpan.className = 'books-author-chip-count';
      countSpan.textContent = String(authorItem.count);
      chip.append(nameSpan, countSpan);
      chip.addEventListener('click', async (event) => {
        if (event.shiftKey || event.altKey) {
          this.activeAuthorFilter =
            this.activeAuthorFilter === authorItem.author
              ? null
              : authorItem.author;
          void this.reloadData();
          return;
        }
        await this.authorModal.open(authorItem.author);
      });
      chips.appendChild(chip);
    });
    section.appendChild(chips);
    this.authorsSectionElement.appendChild(section);
  }

  private renderBooks(filterTerm: string): void {
    if (!this.gridHostElement) return;
    this.activeCards.forEach((card) => card.dispose());
    this.activeCards = [];
    this.gridHostElement.innerHTML = '';
    let allItems = this.bookStore.getItems();
    if (filterTerm) {
      allItems = this.bookStore.search(filterTerm);
    }
    if (this.activeAuthorFilter) {
      const authorLower = this.activeAuthorFilter.toLowerCase();
      allItems = allItems.filter((item) =>
        item.author?.toLowerCase().includes(authorLower),
      );
    }
    if (allItems.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'books-empty-state';
      emptyDiv.textContent = filterTerm
        ? '📚 Ничего не найдено'
        : '📚 Папка пуста';
      this.gridHostElement.appendChild(emptyDiv);
      return;
    }
    const gridElement = document.createElement('div');
    gridElement.className = 'books-grid';
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
    this.gridHostElement.appendChild(gridElement);
  }
}
