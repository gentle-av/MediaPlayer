import { Application } from "./core/app/Application.js";

import { Metadata } from "./core/entities/music/Metadata.js";

const application = new Application();

console.log('✅ Application initialized! Use "app" in console.');
console.log('📝 Commands:');
console.log('  app.musicStore.getAllTracks() - Show all tracks');
console.log('  app.musicStore.getLibrarySize() - Show track count');
console.log('  app.playlistStore.getAllPlaylists() - Show playlists');
