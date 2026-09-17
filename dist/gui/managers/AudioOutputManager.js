export class AudioOutputManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.volume = 50;
        this.muted = false;
        this.currentOutput = 'speakers';
        this.availableOutputs = ['speakers', 'headphones'];
        this.pendingOperation = null;
        if (!apiClient) {
            throw new Error('[AudioOutputManager] AudioOutputApiClient is required');
        }
    }
    getVolume() {
        return this.volume;
    }
    isMuted() {
        return this.muted;
    }
    getCurrentOutput() {
        return this.currentOutput;
    }
    getAvailableOutputs() {
        return [...this.availableOutputs];
    }
    async refreshState() {
        const [volume, output] = await Promise.all([
            this.apiClient.getVolume(),
            this.apiClient.getOutput(),
        ]);
        if (volume !== null) {
            this.volume = volume;
        }
        if (output) {
            this.currentOutput = output.current;
            if (output.available.length > 0) {
                this.availableOutputs = output.available;
            }
        }
    }
    async setVolume(volume) {
        return this.enqueue(async () => {
            const ok = await this.apiClient.setVolume(volume);
            if (ok) {
                this.volume = Math.max(0, Math.min(100, Math.round(volume)));
            }
            return ok;
        });
    }
    async adjustVolume(delta) {
        const next = Math.max(0, Math.min(100, this.volume + delta));
        if (next === this.volume)
            return true;
        return this.setVolume(next);
    }
    async toggleMute() {
        return this.enqueue(async () => {
            const result = await this.apiClient.toggleMute();
            if (result === null)
                return false;
            this.muted = result;
            return true;
        });
    }
    async setOutput(target) {
        return this.enqueue(async () => {
            const ok = await this.apiClient.setOutput(target);
            if (ok) {
                this.currentOutput = target;
            }
            return ok;
        });
    }
    async enqueue(op) {
        if (this.pendingOperation) {
            await this.pendingOperation.catch(() => { });
        }
        const promise = op();
        this.pendingOperation = promise.finally(() => {
            this.pendingOperation = null;
        });
        return promise;
    }
}
//# sourceMappingURL=AudioOutputManager.js.map