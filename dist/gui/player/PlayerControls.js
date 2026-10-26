import { AudioTrackMenu } from '../menu/AudioTrackMenu.js';
import { SubtitleMenu } from '../menu/SubtitleMenu.js';
export class PlayerControls {
    constructor() {
        this.playButtonIcon = null;
        this.audioStreamButton = null;
        this.subtitleButton = null;
        this.fullscreenButton = null;
        this.audioTrackMenu = new AudioTrackMenu();
        this.subtitleMenu = new SubtitleMenu();
        this.activeVideoPath = '';
    }
    setPlayState(isPlaying) {
        if (!this.playButtonIcon) {
            return;
        }
        this.playButtonIcon.replaceChildren();
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const vectorRoot = document.createElementNS(SVG_NS, 'svg');
        vectorRoot.setAttribute('width', '16');
        vectorRoot.setAttribute('height', '16');
        vectorRoot.setAttribute('viewBox', '0 0 24 24');
        if (isPlaying) {
            const firstBar = document.createElementNS(SVG_NS, 'rect');
            firstBar.setAttribute('x', '4');
            firstBar.setAttribute('y', '4');
            firstBar.setAttribute('width', '5');
            firstBar.setAttribute('height', '16');
            firstBar.setAttribute('fill', 'currentColor');
            const secondBar = document.createElementNS(SVG_NS, 'rect');
            secondBar.setAttribute('x', '15');
            secondBar.setAttribute('y', '4');
            secondBar.setAttribute('width', '5');
            secondBar.setAttribute('height', '16');
            secondBar.setAttribute('fill', 'currentColor');
            vectorRoot.append(firstBar, secondBar);
        }
        else {
            const polygon = document.createElementNS(SVG_NS, 'polygon');
            polygon.setAttribute('points', '5 3 19 12 5 21 5 3');
            polygon.setAttribute('fill', 'currentColor');
            vectorRoot.appendChild(polygon);
        }
        this.playButtonIcon.appendChild(vectorRoot);
    }
    updateStreamButton(videoPath, playbackType) {
        const shouldShow = playbackType === 'video' || !!videoPath;
        if (shouldShow) {
            this.activeVideoPath = videoPath || '';
        }
        else {
            this.activeVideoPath = '';
        }
        if (this.audioStreamButton) {
            this.audioStreamButton.classList.toggle('visible', shouldShow);
        }
        if (this.subtitleButton) {
            this.subtitleButton.classList.toggle('visible', shouldShow);
        }
        if (this.fullscreenButton) {
            this.fullscreenButton.classList.toggle('visible', shouldShow);
        }
    }
    render(onPlayPause, onStop, onNext, onPrevious, onToggleFullscreen) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'universal-bottom-player-controls';
        this.audioStreamButton = this.createAudioStreamButton();
        this.subtitleButton = this.createSubtitleButton();
        this.fullscreenButton = this.createFullscreenButton(onToggleFullscreen);
        const skipBackwardBtn = this.createControlButton('polygon', { points: '19 20 9 12 19 4 19 20', fill: 'currentColor' }, 'line', {
            x1: '5',
            y1: '19',
            x2: '5',
            y2: '5',
            stroke: 'currentColor',
            'stroke-width': '2',
        });
        skipBackwardBtn.addEventListener('click', () => {
            onPrevious();
        });
        const standardPlayBtn = document.createElement('button');
        standardPlayBtn.className =
            'universal-bottom-player-btn universal-bottom-player-play';
        const playIconHolder = document.createElement('span');
        playIconHolder.className = 'play-icon-holder';
        playIconHolder.style.display = 'flex';
        standardPlayBtn.appendChild(playIconHolder);
        this.playButtonIcon = playIconHolder;
        this.setPlayState(false);
        standardPlayBtn.addEventListener('click', () => {
            onPlayPause();
        });
        const stopBtn = this.createControlButton('rect', {
            x: '4',
            y: '4',
            width: '16',
            height: '16',
            fill: 'currentColor',
        });
        stopBtn.classList.add('universal-bottom-player-stop');
        stopBtn.addEventListener('click', () => {
            onStop();
        });
        const skipForwardBtn = this.createControlButton('polygon', { points: '5 4 15 12 5 20 5 4', fill: 'currentColor' }, 'line', {
            x1: '19',
            y1: '5',
            x2: '19',
            y2: '19',
            stroke: 'currentColor',
            'stroke-width': '2',
        });
        skipForwardBtn.addEventListener('click', () => {
            onNext();
        });
        controlsContainer.append(this.audioStreamButton, this.subtitleButton, this.fullscreenButton, skipBackwardBtn, standardPlayBtn, stopBtn, skipForwardBtn);
        return controlsContainer;
    }
    createAudioStreamButton() {
        const streamButton = document.createElement('button');
        streamButton.className = 'universal-bottom-player-btn audio-stream-btn';
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const vectorRoot = document.createElementNS(SVG_NS, 'svg');
        vectorRoot.setAttribute('width', '16');
        vectorRoot.setAttribute('height', '16');
        vectorRoot.setAttribute('viewBox', '0 0 24 24');
        vectorRoot.setAttribute('fill', 'none');
        vectorRoot.setAttribute('stroke', 'currentColor');
        vectorRoot.setAttribute('stroke-width', '2');
        vectorRoot.setAttribute('stroke-linecap', 'round');
        vectorRoot.setAttribute('stroke-linejoin', 'round');
        const pathNode1 = document.createElementNS(SVG_NS, 'path');
        pathNode1.setAttribute('d', 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z');
        const pathNode2 = document.createElementNS(SVG_NS, 'path');
        pathNode2.setAttribute('d', 'M19 10v2a7 7 0 0 1-14 0v-2');
        const lineNode1 = document.createElementNS(SVG_NS, 'line');
        lineNode1.setAttribute('x1', '12');
        lineNode1.setAttribute('y1', '19');
        lineNode1.setAttribute('x2', '12');
        lineNode1.setAttribute('y2', '23');
        const lineNode2 = document.createElementNS(SVG_NS, 'line');
        lineNode2.setAttribute('x1', '8');
        lineNode2.setAttribute('y1', '23');
        lineNode2.setAttribute('x2', '16');
        lineNode2.setAttribute('y2', '23');
        vectorRoot.append(pathNode1, pathNode2, lineNode1, lineNode2);
        streamButton.appendChild(vectorRoot);
        streamButton.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            this.audioTrackMenu.show(clickEvent, this.activeVideoPath);
        });
        return streamButton;
    }
    createSubtitleButton() {
        const subtitleButton = document.createElement('button');
        subtitleButton.className = 'universal-bottom-player-btn subtitle-btn';
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const vectorRoot = document.createElementNS(SVG_NS, 'svg');
        vectorRoot.setAttribute('width', '16');
        vectorRoot.setAttribute('height', '16');
        vectorRoot.setAttribute('viewBox', '0 0 24 24');
        vectorRoot.setAttribute('fill', 'none');
        vectorRoot.setAttribute('stroke', 'currentColor');
        vectorRoot.setAttribute('stroke-width', '2');
        vectorRoot.setAttribute('stroke-linecap', 'round');
        vectorRoot.setAttribute('stroke-linejoin', 'round');
        const rectNode = document.createElementNS(SVG_NS, 'rect');
        rectNode.setAttribute('x', '2');
        rectNode.setAttribute('y', '4');
        rectNode.setAttribute('width', '20');
        rectNode.setAttribute('height', '16');
        rectNode.setAttribute('rx', '2');
        const lineNode1 = document.createElementNS(SVG_NS, 'line');
        lineNode1.setAttribute('x1', '6');
        lineNode1.setAttribute('y1', '14');
        lineNode1.setAttribute('x2', '10');
        lineNode1.setAttribute('y2', '14');
        const lineNode2 = document.createElementNS(SVG_NS, 'line');
        lineNode2.setAttribute('x1', '14');
        lineNode2.setAttribute('y1', '14');
        lineNode2.setAttribute('x2', '18');
        lineNode2.setAttribute('y2', '14');
        const lineNode3 = document.createElementNS(SVG_NS, 'line');
        lineNode3.setAttribute('x1', '6');
        lineNode3.setAttribute('y1', '10');
        lineNode3.setAttribute('x2', '18');
        lineNode3.setAttribute('y2', '10');
        vectorRoot.append(rectNode, lineNode1, lineNode2, lineNode3);
        subtitleButton.appendChild(vectorRoot);
        subtitleButton.addEventListener('click', (clickEvent) => {
            clickEvent.preventDefault();
            clickEvent.stopPropagation();
            this.subtitleMenu.show(clickEvent);
        });
        return subtitleButton;
    }
    createFullscreenButton(onToggle) {
        const btn = document.createElement('button');
        btn.className = 'universal-bottom-player-btn fullscreen-btn';
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const vectorRoot = document.createElementNS(SVG_NS, 'svg');
        vectorRoot.setAttribute('width', '16');
        vectorRoot.setAttribute('height', '16');
        vectorRoot.setAttribute('viewBox', '0 0 24 24');
        vectorRoot.setAttribute('fill', 'none');
        vectorRoot.setAttribute('stroke', 'currentColor');
        vectorRoot.setAttribute('stroke-width', '2');
        vectorRoot.setAttribute('stroke-linecap', 'round');
        vectorRoot.setAttribute('stroke-linejoin', 'round');
        const path1 = document.createElementNS(SVG_NS, 'path');
        path1.setAttribute('d', 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3');
        const path2 = document.createElementNS(SVG_NS, 'path');
        path2.setAttribute('d', 'M15 9l-6 6');
        const path3 = document.createElementNS(SVG_NS, 'path');
        path3.setAttribute('d', 'M9 9l6 6');
        vectorRoot.append(path1, path2, path3);
        btn.appendChild(vectorRoot);
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onToggle) {
                onToggle();
            }
        });
        return btn;
    }
    createControlButton(nodeType1, attributes1, nodeType2, attributes2) {
        const controlButton = document.createElement('button');
        controlButton.className = 'universal-bottom-player-btn';
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const vectorRoot = document.createElementNS(SVG_NS, 'svg');
        vectorRoot.setAttribute('width', '16');
        vectorRoot.setAttribute('height', '16');
        vectorRoot.setAttribute('viewBox', '0 0 24 24');
        const firstNode = document.createElementNS(SVG_NS, nodeType1);
        for (const propertyKey in attributes1) {
            firstNode.setAttribute(propertyKey, attributes1[propertyKey]);
        }
        vectorRoot.appendChild(firstNode);
        if (nodeType2 && attributes2) {
            const secondNode = document.createElementNS(SVG_NS, nodeType2);
            for (const propertyKey in attributes2) {
                secondNode.setAttribute(propertyKey, attributes2[propertyKey]);
            }
            vectorRoot.appendChild(secondNode);
        }
        controlButton.appendChild(vectorRoot);
        return controlButton;
    }
}
//# sourceMappingURL=PlayerControls.js.map