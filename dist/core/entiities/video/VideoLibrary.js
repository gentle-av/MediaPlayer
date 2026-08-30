"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoLibrary = void 0;
const VideoItem_1 = require("./VideoItem");
class VideoLibrary {
    final;
    items;
    final;
    String;
    path;
    final;
    bool;
    success;
    factory;
    VideoLibrary;
    fromJson(Map, , String, dynamic) { }
}
exports.VideoLibrary = VideoLibrary;
 > json;
{
    final;
    itemsList = json['items'] ?? [];
    return VideoLibrary(items, itemsList
        .map((item) => VideoItem_1.VideoItem.fromJson(item))
        .toList(), path, json['path'], success, json['success']);
}
Map < String, dynamic > toJson();
{
    return {
        'items': items.map((item) => item.toJson()).toList(),
        'path': path,
        'success': success,
    };
}
