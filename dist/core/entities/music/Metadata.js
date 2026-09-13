export class Metadata {
    constructor(trackTitle, trackArtist, trackAlbum, trackDuration, trackNumber, trackYear, trackGenre, filePath) {
        this.trackTitle = trackTitle;
        this.trackArtist = trackArtist;
        this.trackAlbum = trackAlbum;
        this.trackDuration = trackDuration;
        this.trackNumber = trackNumber;
        this.trackYear = trackYear;
        this.trackGenre = trackGenre;
        this.filePath = filePath;
        this.validate();
    }
    get albumKey() {
        const artist = this.trackArtist.trim() || 'Unknown Artist';
        const album = this.trackAlbum.trim() || 'Unknown Album';
        return `${artist}---|---${album}`.toLowerCase();
    }
    get title() {
        return this.trackTitle;
    }
    get artist() {
        return this.trackArtist;
    }
    get album() {
        return this.trackAlbum;
    }
    get duration() {
        return this.trackDuration;
    }
    get track() {
        return this.trackNumber;
    }
    get year() {
        return this.trackYear;
    }
    get genre() {
        return this.trackGenre;
    }
    set title(title) {
        this.trackTitle = title;
    }
    set artist(artist) {
        this.trackArtist = artist;
    }
    set album(album) {
        this.trackAlbum = album;
    }
    set duration(duration) {
        this.validateDuration(duration);
        this.trackDuration = duration;
    }
    set track(track) {
        this.validateTrack(track);
        this.trackNumber = track;
    }
    set year(year) {
        this.validateYear(year);
        this.trackYear = year;
    }
    set genre(genre) {
        this.trackGenre = genre;
    }
    validate() {
        this.validateDuration(this.trackDuration);
        this.validateTrack(this.trackNumber);
        this.validateYear(this.trackYear);
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
        const hasValidExtension = Metadata.VALID_EXTENSIONS.some((ext) => filePath.toLowerCase().endsWith(ext));
        if (!hasValidExtension) {
            throw new Error(`File must have a valid audio extension: ${Metadata.VALID_EXTENSIONS.join(', ')}`);
        }
    }
    toJSON() {
        return {
            title: this.trackTitle,
            artist: this.trackArtist,
            album: this.trackAlbum,
            duration: this.trackDuration,
            track: this.trackNumber,
            year: this.trackYear,
            genre: this.trackGenre,
            filePath: this.filePath,
        };
    }
}
Metadata.MAX_YEAR = new Date().getFullYear() + 1;
Metadata.MAX_DURATION = 3600 * 10;
Metadata.MAX_TRACK = 999;
Metadata.VALID_EXTENSIONS = [
    '.mp3',
    '.flac',
    '.wav',
    '.m4a',
    '.aac',
    '.ogg',
    '.wma',
];
//# sourceMappingURL=Metadata.js.map