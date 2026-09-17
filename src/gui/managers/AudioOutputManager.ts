import { AudioOutputApiClient } from '../../core/api/AudioOutputApiClient.js';

export type AudioOutputType = 'speakers' | 'headphones';

export class AudioOutputManager {
  private volume = 50;
  private muted = false;
  private currentOutput: AudioOutputType = 'speakers';
  private availableOutputs: string[] = ['speakers', 'headphones'];
  private pendingOperation: Promise<unknown> | null = null;

  constructor(private readonly apiClient: AudioOutputApiClient) {
    if (!apiClient) {
      throw new Error('[AudioOutputManager] AudioOutputApiClient is required');
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getCurrentOutput(): AudioOutputType {
    return this.currentOutput;
  }

  public getAvailableOutputs(): string[] {
    return [...this.availableOutputs];
  }

  public async refreshState(): Promise<void> {
    const [volume, output] = await Promise.all([
      this.apiClient.getVolume(),
      this.apiClient.getOutput(),
    ]);
    if (volume !== null) {
      this.volume = volume;
    }
    if (output) {
      this.currentOutput = output.current as AudioOutputType;
      if (output.available.length > 0) {
        this.availableOutputs = output.available;
      }
    }
  }

  public async setVolume(volume: number): Promise<boolean> {
    return this.enqueue(async () => {
      const ok = await this.apiClient.setVolume(volume);
      if (ok) {
        this.volume = Math.max(0, Math.min(100, Math.round(volume)));
      }
      return ok;
    });
  }

  public async adjustVolume(delta: number): Promise<boolean> {
    const next = Math.max(0, Math.min(100, this.volume + delta));
    if (next === this.volume) return true;
    return this.setVolume(next);
  }

  public async toggleMute(): Promise<boolean> {
    return this.enqueue(async () => {
      const result = await this.apiClient.toggleMute();
      if (result === null) return false;
      this.muted = result;
      return true;
    });
  }

  public async setOutput(target: string): Promise<boolean> {
    return this.enqueue(async () => {
      const ok = await this.apiClient.setOutput(target);
      if (ok) {
        this.currentOutput = target as AudioOutputType;
      }
      return ok;
    });
  }

  private async enqueue<T>(op: () => Promise<T>): Promise<T> {
    if (this.pendingOperation) {
      await this.pendingOperation.catch(() => {});
    }
    const promise = op();
    this.pendingOperation = promise.finally(() => {
      this.pendingOperation = null;
    });
    return promise;
  }
}
