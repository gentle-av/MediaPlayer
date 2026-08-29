export class Metadata {
  private static readonly MAX_TITLE_LENGTH = 200;
  private static readonly MAX_ARTIST_LENGTH = 150;
  private static readonly MAX_ALBUM_LENGTH = 200;
  private static readonly MAX_GENRE_LENGTH = 100;
  private static readonly MIN_YEAR = 1950;
  private static readonly MAX_YEAR = new Date().getFullYear() + 1;
  private static readonly MAX_DURATION = 3600 * 10;
  private static readonly MAX_TRACK = 999;
  private static readonly VALID_EXTENSIONS = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg', '.wma'];

  constructor(
    private _title: string,
    private _artist: string,
    private _album: string,
    private _duration: number,
    private _track: number,
    private _year: number,
    private _genre: string,
    public readonly filePath: string
  ) {
    this.validate();
  }

  private validate(): void {
    this.validateTitle(this._title);
    this.validateArtist(this._artist);
    this.validateAlbum(this._album);
    this.validateDuration(this._duration);
    this.validateTrack(this._track);
    this.validateYear(this._year);
    this.validateGenre(this._genre);
    this.validateFilePath(this.filePath);
  }

  private validateTitle(title: string): void {
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

  private validateArtist(artist: string): void {
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

  private validateAlbum(album: string): void {
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

  private validateDuration(duration: number): void {
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

  private validateTrack(track: number): void {
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

  private validateYear(year: number): void {
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

  private validateGenre(genre: string): void {
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

  private validateFilePath(filePath: string): void {
    if (!filePath || !filePath.trim()) {
      throw new Error('File path is required and cannot be empty');
    }
    const hasValidExtension = Metadata.VALID_EXTENSIONS.some(ext =>
      filePath.toLowerCase().endsWith(ext)
    );
    if (!hasValidExtension) {
      throw new Error(`File must have a valid audio extension: ${Metadata.VALID_EXTENSIONS.join(', ')}`);
    }
    if (filePath.includes('..') || filePath.includes('\\') || filePath.includes(':')) {
      throw new Error('File path contains invalid characters');
    }
  }

  private isValidText(text: string): boolean {
    const invalidPattern = /[<>{}|\\^~\[\]`]/;
    return !invalidPattern.test(text);
  }

  get title(): string { return this._title; }

  get artist(): string { return this._artist; }

  get album(): string { return this._album; }

  get duration(): number { return this._duration; }

  get track(): number { return this._track; }

  get year(): number { return this._year; }

  get genre(): string { return this._genre; }

  set title(title: string) {
    this.validateTitle(title);
    this._title = title;
  }

  set artist(artist: string) {
    this.validateArtist(artist);
    this._artist = artist;
  }

  set album(album: string) {
    this.validateAlbum(album);
    this._album = album;
  }

  set duration(duration: number) {
    this.validateDuration(duration);
    this._duration = duration;
  }

  set track(track: number) {
    this.validateTrack(track);
    this._track = track;
  }

  set year(year: number) {
    this.validateYear(year);
    this._year = year;
  }

  set genre(genre: string) {
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
