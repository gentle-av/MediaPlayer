import { BookItem } from '../../core/entities/book/BookItem.js';
export class AuthorInfoModal {
    constructor(bookStore, reader) {
        this.bookStore = bookStore;
        this.reader = reader;
        this.modalElement = null;
        this.photoObjectUrl = null;
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
        const table = this.createBooksTable(info);
        body.append(top, table);
    }
    close() {
        if (this.photoObjectUrl) {
            URL.revokeObjectURL(this.photoObjectUrl);
            this.photoObjectUrl = null;
        }
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
    createBooksTable(info) {
        const container = document.createElement('div');
        container.className = 'author-info-books';
        if (info.books.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'author-info-empty';
            empty.textContent = 'Книги этого автора не найдены';
            container.appendChild(empty);
            return container;
        }
        const table = document.createElement('table');
        table.className = 'author-books-table';
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['#', 'Название', 'Серия', 'Номер', 'Формат'].forEach((label) => {
            const th = document.createElement('th');
            th.textContent = label;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        const tbody = document.createElement('tbody');
        info.books.forEach((book, index) => {
            tbody.appendChild(this.createBookRow(book, index));
        });
        table.append(thead, tbody);
        container.appendChild(table);
        return container;
    }
    createBookRow(book, index) {
        const row = document.createElement('tr');
        row.className = 'author-book-row';
        const num = document.createElement('td');
        num.className = 'author-book-number';
        num.textContent = String(index + 1);
        const title = document.createElement('td');
        title.className = 'author-book-title';
        title.textContent = book.title || '(без названия)';
        const sequence = document.createElement('td');
        sequence.className = 'author-book-sequence';
        sequence.textContent = book.sequence || '—';
        const seqNumber = document.createElement('td');
        seqNumber.className = 'author-book-seqnumber';
        seqNumber.textContent = book.seq_number ? String(book.seq_number) : '—';
        const format = document.createElement('td');
        format.className = 'author-book-format';
        format.textContent = this.extractFormat(book.path);
        row.append(num, title, sequence, seqNumber, format);
        row.addEventListener('click', async () => {
            const item = new BookItem({
                icon: 'book',
                isDirectory: false,
                isBook: true,
                name: book.title || book.path.split('/').pop() || book.path,
                path: book.path,
                format: this.extractFormat(book.path),
            });
            this.close();
            await this.reader.open(item);
        });
        return row;
    }
    extractFormat(path) {
        const match = /\.([^./\\]+)$/.exec(path);
        return match ? match[1].toUpperCase() : '—';
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