export class PlayerTimeline {
    constructor() {
        this.timeCurrentElement = null;
        this.timeTotalElement = null;
        this.progressFillElement = null;
        this.totalDuration = 0;
    }
    update(elapsedSeconds, totalSeconds) {
        this.totalDuration = totalSeconds;
        if (this.timeCurrentElement) {
            this.timeCurrentElement.textContent = this.formatTime(elapsedSeconds);
        }
        if (this.timeTotalElement) {
            this.timeTotalElement.textContent = this.formatTime(totalSeconds);
        }
        if (this.progressFillElement) {
            const completionPercentage = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;
            this.progressFillElement.style.width = `${completionPercentage}%`;
        }
    }
    render(onSeek) {
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'universal-bottom-player-progress';
        const flexProgressBar = document.createElement('div');
        flexProgressBar.className =
            'universal-bottom-player-progress-bar-container';
        this.timeCurrentElement = document.createElement('span');
        this.timeCurrentElement.className = 'universal-bottom-player-time-current';
        this.timeCurrentElement.textContent = '0:00';
        flexProgressBar.appendChild(this.timeCurrentElement);
        const backgroundProgressBar = document.createElement('div');
        backgroundProgressBar.className = 'universal-bottom-player-progress-bar';
        this.progressFillElement = document.createElement('div');
        this.progressFillElement.className =
            'universal-bottom-player-progress-fill';
        backgroundProgressBar.appendChild(this.progressFillElement);
        backgroundProgressBar.addEventListener('click', (e) => {
            if (this.totalDuration > 0 && onSeek) {
                const rect = backgroundProgressBar.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const percentage = Math.max(0, Math.min(1, clickX / width));
                const targetSeconds = percentage * this.totalDuration;
                onSeek(targetSeconds);
            }
        });
        flexProgressBar.appendChild(backgroundProgressBar);
        this.timeTotalElement = document.createElement('span');
        this.timeTotalElement.className = 'universal-bottom-player-time-total';
        this.timeTotalElement.textContent = '0:00';
        flexProgressBar.appendChild(this.timeTotalElement);
        timelineContainer.appendChild(flexProgressBar);
        return timelineContainer;
    }
    formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds === Infinity || totalSeconds < 0) {
            return '0:00';
        }
        const calculatedMinutes = Math.floor(totalSeconds / 60);
        const calculatedSeconds = Math.floor(totalSeconds % 60);
        return (`${calculatedMinutes}:` +
            `${calculatedSeconds < 10 ? '0' : ''}` +
            `${calculatedSeconds}`);
    }
}
//# sourceMappingURL=PlayerTimeline.js.map