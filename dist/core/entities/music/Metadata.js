export class Metadata {
    constructor(_title, _artist, _album, _duration, _track, _year, _genre, filePath) {
        this._title = _title;
        this._artist = _artist;
        this._album = _album;
        this._duration = _duration;
        this._track = _track;
        this._year = _year;
        this._genre = _genre;
        this.filePath = filePath;
        this.validate();
    }
    validate() {
        this.validateDuration(this._duration);
        this.validateTrack(this._track);
        this.validateYear(this._year);
        this.validateFilePath(this.filePath);
    }
    validateDuration(duration) {
        if (typeof duration !== 'number' || isNaN(duration)) {
            throw new Error('Duration must be a valid number');
        }
        if (duration < 0) {
            throw new Error('Duration cannot be negative');
        }
        if (duration > Metadata.MAX_DURATION) {
            throw new Error(`Duration exceeds maximum of ${Metadata.MAX_DURATION} seconds`);
        }
    }
    validateTrack(track) {
        if (typeof track !== 'number' || isNaN(track)) {
            throw new Error('Track must be a valid number');
        }
        if (track < 0) {
            throw new Error('Track number cannot be negative');
        }
        if (track > Metadata.MAX_TRACK) {
            throw new Error(`Track number exceeds maximum of ${Metadata.MAX_TRACK}`);
        }
        if (!Number.isInteger(track)) {
            throw new Error('Track number must be an integer');
        }
    }
    validateYear(year) {
        if (typeof year !== 'number' || isNaN(year)) {
            throw new Error('Year must be a valid number');
        }
        if (year > Metadata.MAX_YEAR) {
            throw new Error(`Year cannot be later than ${Metadata.MAX_YEAR}`);
        }
        if (!Number.isInteger(year)) {
            throw new Error('Year must be an integer');
        }
    }
    validateFilePath(filePath) {
        if (!filePath || !filePath.trim()) {
            throw new Error('File path is required and cannot be empty');
        }
        const hasValidExtension = Metadata.VALID_EXTENSIONS.some(ext => filePath.toLowerCase().endsWith(ext));
        if (!hasValidExtension) {
            throw new Error(`File must have a valid audio extension: ${Metadata.VALID_EXTENSIONS.join(', ')}`);
        }
    }
    get title() { return this._title; }
    get artist() { return this._artist; }
    get album() { return this._album; }
    get duration() { return this._duration; }
    get track() { return this._track; }
    get year() { return this._year; }
    get genre() { return this._genre; }
    set title(title) {
        this._title = title;
    }
    set artist(artist) {
        this._artist = artist;
    }
    set album(album) {
        this._album = album;
    }
    set duration(duration) {
        this.validateDuration(duration);
        this._duration = duration;
    }
    set track(track) {
        this.validateTrack(track);
        this._track = track;
    }
    set year(year) {
        this.validateYear(year);
        this._year = year;
    }
    set genre(genre) {
        this._genre = genre;
    }
    toJSON() {
        return {
            title: this._title,
            artist: this._artist,
            album: this._album,
            duration: this._duration,
            track: this._track,
            year: this._year,
            genre: this._genre,
            filePath: this.filePath
        };
    }
}
Metadata.MAX_TITLE_LENGTH = 200;
Metadata.MAX_ARTIST_LENGTH = 150;
Metadata.MAX_ALBUM_LENGTH = 200;
Metadata.MAX_GENRE_LENGTH = 100;
Metadata.MAX_YEAR = new Date().getFullYear() + 1;
Metadata.MAX_DURATION = 3600 * 10;
Metadata.MAX_TRACK = 999;
Metadata.VALID_EXTENSIONS = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg', '.wma'];
//# sourceMappingURL=Metadata.js.map