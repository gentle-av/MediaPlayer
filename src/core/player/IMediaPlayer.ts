export interface IMediaPlayer {
  setVisibility(isVisible: boolean): void;
  updateMediaInfo(
    mediaTitle: string,
    mediaArtist: string,
    videoPath?: string,
    playbackType?: 'music' | 'video',
    albumName?: string,
  ): void;
  updateProgress(elapsedSeconds: number, totalSeconds: number): void;
  setPlayState(isPlaying: boolean): void;
  stopAudio(): void;
  bindControls(
    onPlayPause: () => void,
    onStop: () => void,
    onSeek?: (seconds: number) => void,
  ): void;
}
