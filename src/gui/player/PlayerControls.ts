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
    const vectorRoot = document.createElementNS('http://w3.org', 'svg');
    vectorRoot.setAttribute('width', '16');
    vectorRoot.setAttribute('height', '16');
    vectorRoot.setAttribute('viewBox', '0 0 24 24');
    if (isPlaying) {
      const firstBar = document.createElementNS('http://w3.org', 'rect');
      firstBar.setAttribute('x', '6');
      firstBar.setAttribute('y', '4');
      firstBar.setAttribute('width', '4');
      firstBar.setAttribute('height', '16');
      const secondBar = document.createElementNS('http://w3.org', 'rect');
      secondBar.setAttribute('x', '14');
      secondBar.setAttribute('y', '4');
      secondBar.setAttribute('width', '4');
      secondBar.setAttribute('height', '16');
      vectorRoot.append(firstBar, secondBar);
    } else {
      const polygon = document.createElementNS('http://w3.org', 'polygon');
      polygon.setAttribute('points', '5 3 19 12 5 21 5 3');
      vectorRoot.appendChild(polygon);
    }
    this.playButtonIcon.appendChild(vectorRoot);
  }

  public updateStreamButton(videoPath?: string): void {
    if (videoPath) {
      this.activeVideoPath = videoPath;
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
      { points: '19 20 9 12 19 4 19 20' },
      'line',
      { x1: '5', y1: '19', x2: '5', y2: '5' },
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
    });
    stopBtn.classList.add('universal-bottom-player-stop');
    stopBtn.addEventListener('click', () => {
      onStop();
    });
    const skipForwardBtn = this.createControlButton(
      'polygon',
      { points: '5 4 15 12 5 20 5 4' },
      'line',
      { x1: '19', y1: '5', x2: '19', y2: '19' },
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
    const btn = document.createElement('button');
    btn.className = 'universal-bottom-player-btn audio-stream-btn';
    const vectorRoot = document.createElementNS('http://w3.org', 'svg');
    vectorRoot.setAttribute('width', '16');
    vectorRoot.setAttribute('height', '16');
    vectorRoot.setAttribute('viewBox', '0 0 24 24');
    const pathNode1 = document.createElementNS('http://w3.org', 'path');
    pathNode1.setAttribute(
      'd',
      'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z',
    );
    const pathNode2 = document.createElementNS('http://w3.org', 'path');
    pathNode2.setAttribute('d', 'M19 10v2a7 7 0 0 1-14 0v-2');
    const lineNode1 = document.createElementNS('http://w3.org', 'line');
    lineNode1.setAttribute('x1', '12');
    lineNode1.setAttribute('y1', '19');
    lineNode1.setAttribute('x2', '12');
    lineNode1.setAttribute('y2', '23');
    const lineNode2 = document.createElementNS('http://w3.org', 'line');
    lineNode2.setAttribute('x1', '8');
    lineNode2.setAttribute('y1', '23');
    lineNode2.setAttribute('x2', '16');
    lineNode2.setAttribute('y2', '23');
    vectorRoot.append(pathNode1, pathNode2, lineNode1, lineNode2);
    btn.appendChild(vectorRoot);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.activeVideoPath) {
        this.audioTrackMenu.show(e, this.activeVideoPath);
      }
    });
    return btn;
  }

  private createControlButton(
    type1: string,
    attrs1: Record<string, string>,
    type2?: string,
    attrs2?: Record<string, string>,
  ): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'universal-bottom-player-btn';
    const vectorRoot = document.createElementNS('http://w3.org', 'svg');
    vectorRoot.setAttribute('width', '16');
    vectorRoot.setAttribute('height', '16');
    vectorRoot.setAttribute('viewBox', '0 0 24 24');
    const node1 = document.createElementNS('http://w3.org', type1);
    for (const key in attrs1) {
      node1.setAttribute(key, attrs1[key]);
    }
    vectorRoot.appendChild(node1);
    if (type2 && attrs2) {
      const node2 = document.createElementNS('http://w3.org', type2);
      for (const key in attrs2) {
        node2.setAttribute(key, attrs2[key]);
      }
      vectorRoot.appendChild(node2);
    }
    btn.appendChild(vectorRoot);
    return btn;
  }
}
