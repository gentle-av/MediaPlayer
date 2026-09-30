export class AudioOutputManager {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.volume = 50;
        this.muted = false;
        this.currentOutput = 'speakers';
        this.availableOutputs = ['speakers', 'headphones'];
        this.pendingOperation = null;
        /**
         * Флаг, что реальное состояние уже получено с сервера.
         * Пока false — UI не должен подсвечивать ни одну кнопку выхода.
         */
        this.stateLoaded = false;
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
    isStateLoaded() {
        return this.stateLoaded;
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
            this.currentOutput = this.mapRawOutputId(output.current);
            if (output.available.length > 0) {
                const mapped = output.available.map((id) => this.mapRawOutputId(id));
                // Убираем дубликаты, сохраняя порядок.
                this.availableOutputs = Array.from(new Set(mapped));
            }
            this.stateLoaded = true;
        }
        else {
            console.warn('[AudioOutputManager] refreshState: output state unavailable');
        }
    }
    async setVolume(volume) {
        try {
            const ok = await this.apiClient.setVolume(volume);
            if (ok) {
                this.volume = Math.max(0, Math.min(100, Math.round(volume)));
            }
            return ok;
        }
        catch (error) {
            console.error('[AudioOutputManager] Ошибка при изменении громкости:', error);
            return false;
        }
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
                await this.refreshState().catch((error) => console.warn(error));
            }
            return ok;
        });
    }
    mapRawOutputId(rawId) {
        const lower = rawId.toLowerCase();
        if (lower === 'speakers' || lower === 'динамики') {
            return 'speakers';
        }
        if (lower === 'headphones' || lower === 'наушники') {
            return 'headphones';
        }
        return 'speakers';
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