"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Model = require("./model");
class WDRRewriter {
    constructor() {
        this.regex = /https?:\/\/adaptiv\.wdr\.de\/i\/medp\/(ww|de)\/(\w+?)\/(\w+?)\/(\w+?)\/,([\d_,]*?),\.mp4.csmil/;
    }
    canHandle(url) {
        return this.regex.test(url);
    }
    rewrite(url) {
        let match = this.regex.exec(url);
        let qualities = match[5].split(',');
        let videos = [];
        let base = `http://ondemand-${match[1]}.wdr.de/medp/${match[2]}/${match[3]}/${match[4]}/`;
        videos.push({ url: `${base}${qualities[0]}.mp4`, quality: Model.Quality.Low, size: -1 });
        videos.push({ url: `${base}${qualities[1]}.mp4`, quality: Model.Quality.Medium, size: -1 });
        videos.push({ url: `${base}${qualities[2]}.mp4`, quality: Model.Quality.High, size: -1 });
        videos.push({ url: `${base}${qualities[3]}.mp4`, quality: Model.Quality.UltraLow, size: -1 });
        videos.push({ url: `${base}${qualities[4]}.mp4`, quality: Model.Quality.VeryLow, size: -1 });
        return videos;
    }
}
exports.WDRRewriter = WDRRewriter;
class BRRewriter {
    constructor() {
        this.regex = /https?:\/\/cdn-vod-ios.br.de\/i\/(.*?),([a-zA-Z0-9,]+),\.mp4\.csmil/;
    }
    canHandle(url) {
        return this.regex.test(url);
    }
    rewrite(url) {
        let match = this.regex.exec(url);
        let qualities = match[2].split(',');
        let videos = [];
        let base = `http://cdn-storage.br.de/${match[1]}/`;
        videos.push({ url: `${base}${qualities[0]}.mp4`, quality: Model.Quality.UltraLow, size: -1 });
        videos.push({ url: `${base}${qualities[1]}.mp4`, quality: Model.Quality.VeryLow, size: -1 });
        videos.push({ url: `${base}${qualities[2]}.mp4`, quality: Model.Quality.Low, size: -1 });
        videos.push({ url: `${base}${qualities[3]}.mp4`, quality: Model.Quality.Medium, size: -1 });
        videos.push({ url: `${base}${qualities[4]}.mp4`, quality: Model.Quality.High, size: -1 });
        return videos;
    }
}
exports.BRRewriter = BRRewriter;
//# sourceMappingURL=url-rewriter.js.map