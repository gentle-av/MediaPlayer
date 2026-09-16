import { TvApiClient } from '../../core/api/TvApiClient.js';

export class TvPlaybackManager {
  private isTvActive = false;
  private pendingOperation: Promise<boolean> | null = null;

  constructor(private readonly tvApiClient: TvApiClient) {
    if (!tvApiClient) {
      throw new Error('[TvPlaybackManager] TvApiClient is required');
    }
  }

  public getIsActive(): boolean {
    return this.isTvActive;
  }

  public async refreshState(): Promise<boolean> {
    const state = await this.tvApiClient.getTvState();
    this.isTvActive = state?.screen_on ?? false;
    return this.isTvActive;
  }

  public async turnOn(): Promise<boolean> {
    if (this.isTvActive) return true;
    return this.enqueue(async () => {
      const ok = await this.tvApiClient.powerOn();
      if (ok) this.isTvActive = true;
      return ok;
    });
  }

  public async turnOff(): Promise<boolean> {
    if (!this.isTvActive) return true;
    return this.enqueue(async () => {
      const ok = await this.tvApiClient.powerOff();
      if (ok) this.isTvActive = false;
      return ok;
    });
  }

  public async toggle(): Promise<boolean> {
    return this.isTvActive ? this.turnOff() : this.turnOn();
  }

  private async enqueue(op: () => Promise<boolean>): Promise<boolean> {
    if (this.pendingOperation) {
      await this.pendingOperation.catch(() => {});
    }
    this.pendingOperation = op().finally(() => {
      this.pendingOperation = null;
    });
    return this.pendingOperation;
  }
}
