import { BookItem } from '../../core/entities/book/BookItem.js';
export class AuthorInfoModal {
    constructor(bookStore, reader) {
        this.bookStore = bookStore;
        this.reader = reader;
        this.modalElement = null;
        this.photoObjectUrl = null;
        this.activeBookObjectUrls = [];
    }
    async open(authorName) {
        this.close();
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal active author-info-modal';
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content author-info-modal-content';
        const header = document.createElement('div');
        header.className = 'author-info-header';
        const headerTitle = document.createElement('div');
        headerTitle.className = 'author-info-header-title';
        headerTitle.textContent = 'Автор';
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '×';
        closeButton.addEventListener('click', () => this.close());
        header.append(headerTitle, closeButton);
        const body = document.createElement('div');
        body.className = 'author-info-body';
        const loading = document.createElement('div');
        loading.className = 'author-info-loading';
        loading.textContent = 'Загрузка информации об авторе...';
        body.appendChild(loading);
        modalContent.append(header, body);
        this.modalElement.appendChild(modalContent);
        document.body.appendChild(this.modalElement);
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement)
                this.close();
        });
        const info = await this.bookStore.getAuthorInfo(authorName);
        if (!this.modalElement)
            return;
        if (!info) {
            loading.textContent = 'Не удалось загрузить информацию об авторе';
            return;
        }
        body.innerHTML = '';
        const top = this.createTopSection(info);
        const grid = this.createBooksGrid(info);
        body.append(top, grid);
    }
    close() {
        if (this.photoObjectUrl) {
            URL.revokeObjectURL(this.photoObjectUrl);
            this.photoObjectUrl = null;
        }
        this.activeBookObjectUrls.forEach((url) => URL.revokeObjectURL(url));
        this.activeBookObjectUrls = [];
        const existing = document.querySelector('.author-info-modal');
        if (existing && existing.parentNode) {
            existing.parentNode.removeChild(existing);
        }
        this.modalElement = null;
    }
    createTopSection(info) {
        const top = document.createElement('div');
        top.className = 'author-info-top';
        const photoWrap = document.createElement('div');
        photoWrap.className = 'author-info-photo';
        const placeholder = document.createElement('div');
        placeholder.className = 'author-info-photo-placeholder';
        placeholder.textContent = '👤';
        photoWrap.appendChild(placeholder);
        this.applyPhoto(photoWrap, placeholder, info);
        const meta = document.createElement('div');
        meta.className = 'author-info-meta';
        const fullName = document.createElement('h2');
        fullName.className = 'author-info-name';
        fullName.textContent = info.full_name || info.name;
        const years = document.createElement('div');
        years.className = 'author-info-years';
        const yStr = this.formatYears(info.birth_year, info.death_year);
        years.textContent = yStr || 'Годы жизни неизвестны';
        const booksCount = document.createElement('div');
        booksCount.className = 'author-info-count';
        booksCount.textContent = `Книг в библиотеке: ${info.books.length}`;
        meta.append(fullName, years, booksCount);
        if (info.biography) {
            const bio = document.createElement('p');
            bio.className = 'author-info-bio';
            bio.textContent = info.biography;
            meta.appendChild(bio);
        }
        top.append(photoWrap, meta);
        return top;
    }
    applyPhoto(wrap, placeholder, info) {
        const applySrc = (src) => {
            const img = document.createElement('img');
            img.className = 'author-info-photo-img';
            img.alt = info.full_name || info.name;
            img.src = src;
            img.addEventListener('load', () => {
                placeholder.style.display = 'none';
                img.classList.add('visible-img');
            });
            img.addEventListener('error', () => {
                img.remove();
                placeholder.style.display = 'flex';
            });
            wrap.appendChild(img);
        };
        if (info.photo_base64) {
            const mime = info.photo_mime || 'image/jpeg';
            applySrc(`data:${mime};base64,${info.photo_base64}`);
            return;
        }
        if (info.photo_url) {
            applySrc(info.photo_url);
        }
    }
    createBooksGrid(info) {
        const container = document.createElement('div');
        container.className = 'author-info-books';
        if (info.books.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'author-info-empty';
            empty.textContent = 'Книги этого автора не найдены';
            container.appendChild(empty);
            return container;
        }
        const grid = document.createElement('div');
        grid.className = 'author-books-grid';
        info.books.forEach((book) => {
            const card = document.createElement('div');
            card.className = 'author-book-card';
            const coverContainer = document.createElement('div');
            coverContainer.className = 'author-book-cover';
            const placeholder = document.createElement('div');
            placeholder.className = 'author-book-placeholder';
            placeholder.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
            coverContainer.appendChild(placeholder);
            if (book.has_cover) {
                this.bookStore.getBookCover(book.path).then((blob) => {
                    if (blob && blob.size > 0) {
                        const url = URL.createObjectURL(blob);
                        this.activeBookObjectUrls.push(url);
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = book.title;
                        img.style.display = 'block';
                        placeholder.style.display = 'none';
                        coverContainer.appendChild(img);
                    }
                }).catch(err => console.warn('Cover load error', err));
            }
            const titleContainer = document.createElement('div');
            titleContainer.className = 'author-book-card-title';
            titleContainer.textContent = book.title || '(без названия)';
            titleContainer.title = book.title || '(без названия)';
            card.append(coverContainer, titleContainer);
            card.addEventListener('click', async () => {
                const item = new BookItem({
                    icon: 'book',
                    isDirectory: false,
                    isBook: true,
                    name: book.title || book.path.split('/').pop() || book.path,
                    path: book.path,
                    format: 'FB2',
                });
                this.close();
                await this.reader.open(item);
            });
            grid.appendChild(card);
        });
        container.appendChild(grid);
        return container;
    }
    formatYears(birth, death) {
        if (birth && death)
            return `${birth}–${death}`;
        if (birth)
            return `род. ${birth}`;
        if (death)
            return `ум. ${death}`;
        return '';
    }
}
//# sourceMappingURL=AuthorInfoModal.js.map