import { AudioOutputApiClient } from '../../core/api/AudioOutputApiClient.js';

export type AudioOutputType = 'speakers' | 'headphones';

export class AudioOutputManager {
  private volume = 50;
  private muted = false;
  private currentOutput: AudioOutputType = 'speakers';
  private availableOutputs: string[] = ['speakers', 'headphones'];
  private pendingOperation: Promise<unknown> | null = null;

  /**
   * Флаг, что реальное состояние уже получено с сервера.
   * Пока false — UI не должен подсвечивать ни одну кнопку выхода.
   */
  private stateLoaded = false;

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

  public isStateLoaded(): boolean {
    return this.stateLoaded;
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
      this.currentOutput = this.mapRawOutputId(output.current);

      if (output.available.length > 0) {
        const mapped = output.available.map((id: string) =>
          this.mapRawOutputId(id),
        );
        // Убираем дубликаты, сохраняя порядок.
        this.availableOutputs = Array.from(new Set(mapped));
      }

      this.stateLoaded = true;
    } else {
      console.warn(
        '[AudioOutputManager] refreshState: output state unavailable',
      );
    }
  }

  public async setVolume(volume: number): Promise<boolean> {
    try {
      const ok = await this.apiClient.setVolume(volume);
      if (ok) {
        this.volume = Math.max(0, Math.min(100, Math.round(volume)));
      }
      return ok;
    } catch (error) {
      console.error(
        '[AudioOutputManager] Ошибка при изменении громкости:',
        error,
      );
      return false;
    }
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
        await this.refreshState().catch((error) => console.warn(error));
      }
      return ok;
    });
  }

  private mapRawOutputId(rawId: string): AudioOutputType {
    const lower = rawId.toLowerCase();
    if (lower === 'speakers' || lower === 'динамики') {
      return 'speakers';
    }
    if (lower === 'headphones' || lower === 'наушники') {
      return 'headphones';
    }
    return 'speakers';
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
