import { AudioTrackMenu } from '../menu/AudioTrackMenu.js';

export class PlayerControls {
  private playButtonIcon: HTMLElement | null = null;
  private audioStreamButton: HTMLButtonElement | null = null;
  private audioTrackMenu = new AudioTrackMenu();
  private activeVideoPath = '';

  public setPlayState(isPlaying: boolean): void {
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
    } else {
      const polygon = document.createElementNS(SVG_NS, 'polygon');
      polygon.setAttribute('points', '5 3 19 12 5 21 5 3');
      polygon.setAttribute('fill', 'currentColor');
      vectorRoot.appendChild(polygon);
    }
    this.playButtonIcon.appendChild(vectorRoot);
  }

  public updateStreamButton(
    videoPath?: string,
    playbackType?: 'music' | 'video',
  ): void {
    if (playbackType === 'video' || videoPath) {
      this.activeVideoPath = videoPath || '';
      if (this.audioStreamButton) {
        this.audioStreamButton.style.display = 'flex';
      }
    } else {
      this.activeVideoPath = '';
      if (this.audioStreamButton) {
        this.audioStreamButton.style.display = 'none';
      }
    }
  }

  public render(onPlayPause: () => void, onStop: () => void): HTMLElement {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'universal-bottom-player-controls';
    this.audioStreamButton = this.createAudioStreamButton();
    const skipBackwardBtn = this.createControlButton(
      'polygon',
      { points: '19 20 9 12 19 4 19 20', fill: 'currentColor' },
      'line',
      {
        x1: '5',
        y1: '19',
        x2: '5',
        y2: '5',
        stroke: 'currentColor',
        'stroke-width': '2',
      },
    );
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
    const skipForwardBtn = this.createControlButton(
      'polygon',
      { points: '5 4 15 12 5 20 5 4', fill: 'currentColor' },
      'line',
      {
        x1: '19',
        y1: '5',
        x2: '19',
        y2: '19',
        stroke: 'currentColor',
        'stroke-width': '2',
      },
    );
    controlsContainer.append(
      this.audioStreamButton,
      skipBackwardBtn,
      standardPlayBtn,
      stopBtn,
      skipForwardBtn,
    );
    return controlsContainer;
  }

  private createAudioStreamButton(): HTMLButtonElement {
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
    pathNode1.setAttribute(
      'd',
      'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z',
    );
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
      if (this.activeVideoPath) {
        this.audioTrackMenu.show(clickEvent, this.activeVideoPath);
      }
    });
    return streamButton;
  }

  private createControlButton(
    nodeType1: string,
    attributes1: Record<string, string>,
    nodeType2?: string,
    attributes2?: Record<string, string>,
  ): HTMLButtonElement {
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
