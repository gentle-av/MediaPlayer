import { MainFrame } from "../../gui/MainFrame.js";
export class Application {
    constructor() {
        this.mainContainer = document.getElementById('main');
        this.mainFrame = new MainFrame();
        this.initialize();
        this.render();
    }
    render() {
        if (this.mainContainer) {
            this.mainContainer.innerHTML = '';
            const appElement = this.mainFrame.render();
            this.mainContainer.appendChild(appElement);
        }
        else {
            console.error('Main container not found');
        }
    }
    async initialize() {
        return await this.mainFrame.initialize();
    }
}
//# sourceMappingURL=Application.js.map