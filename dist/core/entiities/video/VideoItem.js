"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoItem = void 0;
class VideoItem {
    final;
    String;
    icon;
    final;
    bool;
    isDirectory;
    final;
    bool;
    isVideo;
    final;
    String;
    name;
    final;
    String;
    path;
    final;
    String;
    size;
    factory;
    VideoItem;
    fromJson(Map, , String, dynamic) { }
}
exports.VideoItem = VideoItem;
 > json;
{
    return VideoItem(icon, json['icon'], isDirectory, json['isDirectory'], isVideo, json['isVideo'], name, json['name'], path, json['path'], size, json['size']);
}
Map < String, dynamic > toJson();
{
    return {
        'icon': icon,
        'isDirectory': isDirectory,
        'isVideo': isVideo,
        'name': name,
        'path': path,
        'size': size,
    };
}
