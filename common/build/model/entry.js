"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Field;
(function (Field) {
    Field["ID"] = "id";
    Field["Channel"] = "channel";
    Field["Topic"] = "topic";
    Field["Title"] = "title";
    Field["Timestamp"] = "timestamp";
    Field["Duration"] = "duration";
    Field["Description"] = "description";
    Field["Website"] = "website";
    Field["MediaType"] = "media.type";
    Field["MediaUrl"] = "media.url";
    Field["MediaSize"] = "media.size";
    Field["VideoQuality"] = "media.quality";
    Field["AudioQuality"] = "media.quality";
    Field["LastSeen"] = "metadata.lastSeen";
})(Field = exports.Field || (exports.Field = {}));
var MediaType;
(function (MediaType) {
    MediaType[MediaType["Video"] = 0] = "Video";
    MediaType[MediaType["Audio"] = 1] = "Audio";
    MediaType[MediaType["Subtitle"] = 2] = "Subtitle";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
class Video {
    constructor(quality, url, size) {
        this.type = MediaType.Video;
        this.quality = quality;
        this.url = url;
        this.size = size;
    }
}
exports.Video = Video;
class Subtitle {
    constructor(url, size) {
        this.type = MediaType.Subtitle;
        this.url = url;
        this.size = size;
    }
}
exports.Subtitle = Subtitle;
var Quality;
(function (Quality) {
    Quality[Quality["UltraLow"] = 0] = "UltraLow";
    Quality[Quality["VeryLow"] = 1] = "VeryLow";
    Quality[Quality["Low"] = 2] = "Low";
    Quality[Quality["Medium"] = 3] = "Medium";
    Quality[Quality["High"] = 4] = "High";
    Quality[Quality["VeryHigh"] = 5] = "VeryHigh";
})(Quality = exports.Quality || (exports.Quality = {}));
