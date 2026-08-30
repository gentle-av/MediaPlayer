"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const VideoStore_1 = require("../store/VideoStore");
class Application {
    mainContainer;
    videoStore;
    constructor() {
        this.mainContainer = document.getElementById('main');
        this.videoStore = new VideoStore_1.VideoStore();
    }
}
exports.Application = Application;
