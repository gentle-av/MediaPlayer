import { ToastService } from '../components/ToastService.js';
export class BookReaderModal {
    constructor(bookStore) {
        this.bookStore = bookStore;
        this.modalElement = null;
        this.contentContainer = null;
        this.currentBook = null;
        this.pages = [];
        this.currentPage = 0;
        this.saveTimer = null;
    }
    async open(book) {
        this.close();
        this.currentBook = book;
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal active book-reader-modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content book-reader-content';
        const header = this.createHeader(book);
        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'book-reader-body';
        const loading = document.createElement('div');
        loading.className = 'book-reader-loading';
        loading.textContent = 'Загрузка книги...';
        this.contentContainer.appendChild(loading);
        const footer = this.createFooter();
        modalContent.append(header, this.contentContainer, footer);
        this.modalElement.appendChild(modalContent);
        document.body.appendChild(this.modalElement);
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement)
                this.close();
        });
        const content = await this.bookStore.openBook(book);
        if (!content) {
            loading.textContent = 'Не удалось загрузить содержимое книги';
            return;
        }
        // Парсим XML и создаем страницы
        this.pages = this.paginate(content);
        const savedPosition = await this.bookStore.getProgress(book.path);
        if (savedPosition !== null && savedPosition < this.pages.length) {
            this.currentPage = savedPosition;
        }
        this.renderPage();
    }
    close() {
        if (this.saveTimer !== null) {
            window.clearTimeout(this.saveTimer);
            this.saveTimer = null;
        }
        if (this.currentBook) {
            this.saveProgressNow();
        }
        const existing = document.querySelector('.book-reader-modal');
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }
        this.modalElement = null;
        this.contentContainer = null;
        this.currentBook = null;
        this.pages = [];
        this.currentPage = 0;
    }
    createHeader(book) {
        const header = document.createElement('div');
        header.className = 'modal-header book-reader-header';
        const title = document.createElement('div');
        title.className = 'book-reader-title';
        title.textContent = book.name;
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.close());
        header.append(title, closeButton);
        return header;
    }
    createFooter() {
        const footer = document.createElement('div');
        footer.className = 'modal-album-actions book-reader-footer';
        const prevBtn = document.createElement('button');
        prevBtn.className = 'modal-add-btn';
        prevBtn.innerHTML = '<span>← Назад</span>';
        prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        const pageInfo = document.createElement('span');
        pageInfo.className = 'book-reader-page-info';
        pageInfo.id = 'bookReaderPageInfo';
        pageInfo.textContent = '0 / 0';
        const nextBtn = document.createElement('button');
        nextBtn.className = 'modal-play-btn';
        nextBtn.innerHTML = '<span>Вперёд →</span>';
        nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        footer.append(prevBtn, pageInfo, nextBtn);
        return footer;
    }
    paginate(rawXml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawXml, 'text/xml');
        // Находим все параграфы, заголовки и стихи в теле
        const body = doc.querySelector('body');
        if (!body)
            return [this.createErrorPage('Не удалось найти текст книги в файле.')];
        const elements = body.querySelectorAll('p, title, subtitle, v');
        const paragraphs = [];
        elements.forEach(el => {
            if (el.tagName === 'title' || el.tagName === 'subtitle') {
                const text = el.textContent?.trim();
                if (text)
                    paragraphs.push(`<h2 class="book-chapter-title">${text}</h2>`);
            }
            else {
                const text = el.textContent?.trim();
                if (text)
                    paragraphs.push(`<p>${text}</p>`);
            }
        });
        if (paragraphs.length === 0) {
            return [this.createErrorPage('В книге нет текстового содержимого.')];
        }
        const pages = [];
        const chunkSize = 10; // Количество абзацев на страницу
        for (let i = 0; i < paragraphs.length; i += chunkSize) {
            const pageEl = document.createElement('div');
            pageEl.className = 'book-reader-page';
            // Склеиваем абзацы в одну HTML-строку и вставляем в div
            pageEl.innerHTML = paragraphs.slice(i, i + chunkSize).join('\n');
            pages.push(pageEl);
        }
        return pages;
    }
    createErrorPage(message) {
        const pageEl = document.createElement('div');
        pageEl.className = 'book-reader-page';
        pageEl.textContent = message;
        return pageEl;
    }
    renderPage() {
        if (!this.contentContainer)
            return;
        const pageElement = this.pages[this.currentPage];
        if (!pageElement)
            return;
        this.contentContainer.innerHTML = '';
        this.contentContainer.appendChild(pageElement.cloneNode(true));
        this.contentContainer.scrollTop = 0;
        const pageInfo = document.getElementById('bookReaderPageInfo');
        if (pageInfo) {
            pageInfo.textContent = `${this.currentPage + 1} / ${this.pages.length}`;
        }
        this.scheduleProgressSave();
    }
    goToPage(index) {
        if (index < 0 || index >= this.pages.length)
            return;
        this.currentPage = index;
        this.renderPage();
    }
    scheduleProgressSave() {
        if (this.saveTimer !== null) {
            window.clearTimeout(this.saveTimer);
        }
        this.saveTimer = window.setTimeout(() => {
            this.saveProgressNow();
        }, 1000);
    }
    async saveProgressNow() {
        if (!this.currentBook)
            return;
        const success = await this.bookStore.saveProgress(this.currentBook.path, this.currentPage);
        if (!success) {
            ToastService.getInstance().show('Не удалось сохранить прогресс', 'error');
        }
    }
}
//# sourceMappingURL=BookReaderModal.js.map