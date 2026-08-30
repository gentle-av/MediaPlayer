"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const MusicStore_1 = require("../store/MusicStore");
const PlaylistStore_1 = require("../store/PlaylistStore");
const VideoStore_1 = require("../store/VideoStore");
class Application {
    mainContainer;
    musicStore;
    playlistStore;
    videoStore;
    constructor() {
        this.mainContainer = document.getElementById('main');
        this.musicStore = new MusicStore_1.MusicStore();
        this.playlistStore = new PlaylistStore_1.PlaylistStore(this.musicStore);
        this.videoStore = new VideoStore_1.VideoStore();
    }
}
exports.Application = Application;
