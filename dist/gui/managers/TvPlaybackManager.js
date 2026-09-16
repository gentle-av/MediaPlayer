export class TvPlaybackManager {
    constructor(tvApiClient) {
        this.tvApiClient = tvApiClient;
        this.isTvActive = false;
        this.pendingOperation = null;
        if (!tvApiClient) {
            throw new Error('[TvPlaybackManager] TvApiClient is required');
        }
    }
    getIsActive() {
        return this.isTvActive;
    }
    async refreshState() {
        const state = await this.tvApiClient.getTvState();
        this.isTvActive = state?.screen_on ?? false;
        return this.isTvActive;
    }
    async turnOn() {
        if (this.isTvActive)
            return true;
        return this.enqueue(async () => {
            const ok = await this.tvApiClient.powerOn();
            if (ok)
                this.isTvActive = true;
            return ok;
        });
    }
    async turnOff() {
        if (!this.isTvActive)
            return true;
        return this.enqueue(async () => {
            const ok = await this.tvApiClient.powerOff();
            if (ok)
                this.isTvActive = false;
            return ok;
        });
    }
    async toggle() {
        return this.isTvActive ? this.turnOff() : this.turnOn();
    }
    async enqueue(op) {
        if (this.pendingOperation) {
            await this.pendingOperation.catch(() => { });
        }
        this.pendingOperation = op().finally(() => {
            this.pendingOperation = null;
        });
        return this.pendingOperation;
    }
}
//# sourceMappingURL=TvPlaybackManager.js.map