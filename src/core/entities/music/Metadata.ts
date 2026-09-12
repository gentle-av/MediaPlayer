export class Metadata {
  private static readonly MAX_YEAR = new Date().getFullYear() + 1;
  private static readonly MAX_DURATION = 3600 * 10;
  private static readonly MAX_TRACK = 999;
  private static readonly VALID_EXTENSIONS = ['.mp3', '.flac', '.wav', '.m4a', '.aac', '.ogg', '.wma'];

  constructor(
    private trackTitle: string,
    private trackArtist: string,
    private trackAlbum: string,
    private trackDuration: number,
    private trackNumber: number,
    private trackYear: number,
    private trackGenre: string,
    public readonly filePath: string,
  ) {
    this.validate();
  }

  get albumKey(): string {
    const artist = this.trackArtist.trim() || 'Unknown Artist';
    const album = this.trackAlbum.trim() || 'Unknown Album';
    return `${artist}---|---${album}`.toLowerCase();
  }

  get title(): string {
    return this.trackTitle;
  }

  get artist(): string {
    return this.trackArtist;
  }

  get album(): string {
    return this.trackAlbum;
  }

  get duration(): number {
    return this.trackDuration;
  }

  get track(): number {
    return this.trackNumber;
  }

  get year(): number {
    return this.trackYear;
  }

  get genre(): string {
    return this.trackGenre;
  }

  set title(title: string) {
    this.trackTitle = title;
  }

  set artist(artist: string) {
    this.trackArtist = artist;
  }

  set album(album: string) {
    this.trackAlbum = album;
  }

  set duration(duration: number) {
    this.validateDuration(duration);
    this.trackDuration = duration;
  }

  set track(track: number) {
    this.validateTrack(track);
    this.trackNumber = track;
  }

  set year(year: number) {
    this.validateYear(year);
    this.trackYear = year;
  }

  set genre(genre: string) {
    this.trackGenre = genre;
  }

  private validate(): void {
    this.validateDuration(this.trackDuration);
    this.validateTrack(this.trackNumber);
    this.validateYear(this.trackYear);
    this.validateFilePath(this.filePath);
  }

  private validateDuration(duration: number): void {
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

  private validateTrack(track: number): void {
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

  private validateYear(year: number): void {
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

  private validateFilePath(filePath: string): void {
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
