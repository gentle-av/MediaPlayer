import { MainFrame } from "../../gui/MainFrame.js"

export class Application {
  private mainContainer: HTMLElement | null;
  private mainFrame: MainFrame;

  constructor() {
    this.mainContainer = document.getElementById('main');
    this.mainFrame = new MainFrame();
    this.initialize();
    this.render();
  }

  private render(): void {
    if (this.mainContainer) {
      this.mainContainer.innerHTML = '';
      const appElement = this.mainFrame.render();
      this.mainContainer.appendChild(appElement);
    } else {
      console.error('Main container not found');
    }
  }

  private async initialize(): Promise<void> {
    return await this.mainFrame.initialize();
  }
}
