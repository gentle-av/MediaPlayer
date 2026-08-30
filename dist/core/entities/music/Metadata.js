"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = void 0;
class Metadata {
    _title;
    _artist;
    _album;
    _duration;
    _track;
    _year;
    _genre;
    filePath;
    static MAX_TITLE_LENGTH = 200;
    static MAX_ARTIST_LENGTH = 150;
    static MAX_ALBUM_LENGTH = 200;
    static MAX_GENRE_LENGTH = 100;
    static MIN_YEAR = 1950;
    static MAX_YEAR = new Date().getFullYear() + 1;
    static MAX_DURATION = 3600 * 10;
    static MAX_TRACK = 999;
    static VALID_EXTENSIONS = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg', '.wma'];
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
        this.validateTitle(this._title);
        this.validateArtist(this._artist);
        this.validateAlbum(this._album);
        this.validateDuration(this._duration);
        this.validateTrack(this._track);
        this.validateYear(this._year);
        this.validateGenre(this._genre);
        this.validateFilePath(this.filePath);
    }
    validateTitle(title) {
        if (!title || !title.trim()) {
            throw new Error('Title is required and cannot be empty');
        }
        if (title.length > Metadata.MAX_TITLE_LENGTH) {
            throw new Error(`Title exceeds maximum length of ${Metadata.MAX_TITLE_LENGTH} characters`);
        }
        if (!this.isValidText(title)) {
            throw new Error('Title contains invalid characters');
        }
    }
    validateArtist(artist) {
        if (!artist || !artist.trim()) {
            throw new Error('Artist is required and cannot be empty');
        }
        if (artist.length > Metadata.MAX_ARTIST_LENGTH) {
            throw new Error(`Artist exceeds maximum length of ${Metadata.MAX_ARTIST_LENGTH} characters`);
        }
        if (!this.isValidText(artist)) {
            throw new Error('Artist contains invalid characters');
        }
    }
    validateAlbum(album) {
        if (!album || !album.trim()) {
            throw new Error('Album is required and cannot be empty');
        }
        if (album.length > Metadata.MAX_ALBUM_LENGTH) {
            throw new Error(`Album exceeds maximum length of ${Metadata.MAX_ALBUM_LENGTH} characters`);
        }
        if (!this.isValidText(album)) {
            throw new Error('Album contains invalid characters');
        }
    }
    validateDuration(duration) {
        if (typeof duration !== 'number' || isNaN(duration)) {
            throw new Error('Duration must be a valid number');
        }
        if (duration < 0) {
            throw new Error('Duration cannot be negative');
        }
        if (duration === 0) {
            throw new Error('Duration must be greater than 0');
        }
        if (duration > Metadata.MAX_DURATION) {
            throw new Error(`Duration exceeds maximum of ${Metadata.MAX_DURATION} seconds`);
        }
        if (duration < 1) {
            throw new Error('Duration is too short (minimum 1 second)');
        }
    }
    validateTrack(track) {
        if (typeof track !== 'number' || isNaN(track)) {
            throw new Error('Track must be a valid number');
        }
        if (track < 0) {
            throw new Error('Track number cannot be negative');
        }
        if (track === 0) {
            throw new Error('Track number must be 1 or greater');
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
        if (year < Metadata.MIN_YEAR) {
            throw new Error(`Year cannot be earlier than ${Metadata.MIN_YEAR}`);
        }
        if (year > Metadata.MAX_YEAR) {
            throw new Error(`Year cannot be later than ${Metadata.MAX_YEAR}`);
        }
        if (!Number.isInteger(year)) {
            throw new Error('Year must be an integer');
        }
    }
    validateGenre(genre) {
        if (!genre || !genre.trim()) {
            throw new Error('Genre is required and cannot be empty');
        }
        if (genre.length > Metadata.MAX_GENRE_LENGTH) {
            throw new Error(`Genre exceeds maximum length of ${Metadata.MAX_GENRE_LENGTH} characters`);
        }
        if (!this.isValidText(genre)) {
            throw new Error('Genre contains invalid characters');
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
        if (filePath.includes('..') || filePath.includes('\\') || filePath.includes(':')) {
            throw new Error('File path contains invalid characters');
        }
    }
    isValidText(text) {
        const invalidPattern = /[<>{}|\\^~\[\]`]/;
        return !invalidPattern.test(text);
    }
    get title() { return this._title; }
    get artist() { return this._artist; }
    get album() { return this._album; }
    get duration() { return this._duration; }
    get track() { return this._track; }
    get year() { return this._year; }
    get genre() { return this._genre; }
    set title(title) {
        this.validateTitle(title);
        this._title = title;
    }
    set artist(artist) {
        this.validateArtist(artist);
        this._artist = artist;
    }
    set album(album) {
        this.validateAlbum(album);
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
        this.validateGenre(genre);
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
exports.Metadata = Metadata;
