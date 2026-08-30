import { Application } from "./core/app/Application.js";

const application = new Application();

(window as any).app = application;
(window as any).Application = Application;

import { Metadata } from "./core/entities/music/Metadata.js";
import { MusicStore } from "./core/store/MusicStore.js";
import { PlaylistStore } from "./core/store/PlaylistStore.js";

(window as any).Metadata = Metadata;
(window as any).MusicStore = MusicStore;
(window as any).PlaylistStore = PlaylistStore;

console.log('✅ Application initialized! Use "app" in console.');
console.log('📝 Commands:');
console.log('  app.musicStore.getAllTracks() - Show all tracks');
console.log('  app.musicStore.getLibrarySize() - Show track count');
console.log('  app.playlistStore.getAllPlaylists() - Show playlists');
