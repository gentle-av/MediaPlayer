export class BookCard {
    constructor(bookItem, bookStore) {
        this.bookItem = bookItem;
        this.bookStore = bookStore;
        this.currentObjectUrl = null;
        this.uniqueCardId = `book_card_${this.bookItem.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }
    render() {
        const cardElement = document.createElement('figure');
        cardElement.className = 'books-card';
        cardElement.dataset.path = this.bookItem.path;
        const coverContainer = document.createElement('div');
        coverContainer.className = 'books-card-cover';
        const placeholder = document.createElement('div');
        placeholder.className = 'books-card-placeholder';
        if (this.bookItem.isDirectory) {
            placeholder.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
        }
        else {
            placeholder.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
        }
        coverContainer.appendChild(placeholder);
        if (this.bookItem.isBook && this.bookItem.hasCover) {
            const imgElement = document.createElement('img');
            imgElement.className = 'books-card-cover-img';
            imgElement.alt = this.bookItem.name;
            imgElement.style.display = 'none';
            this.bookStore
                .getBookCover(this.bookItem.path)
                .then((blob) => {
                if (blob && blob.size > 0) {
                    if (this.currentObjectUrl) {
                        URL.revokeObjectURL(this.currentObjectUrl);
                    }
                    this.currentObjectUrl = URL.createObjectURL(blob);
                    imgElement.src = this.currentObjectUrl;
                    imgElement.style.display = 'block';
                    placeholder.style.display = 'none';
                }
            })
                .catch((error) => {
                console.warn(`Failed to load cover for ${this.bookItem.name}`, error);
            });
            coverContainer.appendChild(imgElement);
        }
        const caption = document.createElement('figcaption');
        caption.className = 'books-card-caption';
        caption.textContent = this.bookItem.name;
        cardElement.append(coverContainer, caption);
        return cardElement;
    }
    dispose() {
        if (this.currentObjectUrl) {
            URL.revokeObjectURL(this.currentObjectUrl);
            this.currentObjectUrl = null;
        }
    }
}
//# sourceMappingURL=BookCard.js.map