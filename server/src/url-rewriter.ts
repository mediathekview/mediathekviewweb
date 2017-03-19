import * as Model from './model';

export interface IUrlRewriter {
    canHandle(url: string): boolean;
    rewrite(url: string): Model.Video[];
}

export class WDRRewriter implements IUrlRewriter {
    regex: RegExp = /https?:\/\/adaptiv\.wdr\.de\/i\/medp\/(ww|de)\/(\w+?)\/(\w+?)\/(\w+?)\/,([\d_,]*?),\.mp4.csmil/;

    canHandle(url: string) {
        return this.regex.test(url);
    }

    rewrite(url: string): Model.Video[] {
        let match = this.regex.exec(url);

        let qualities = match[5].split(',');
        //0:low, 1: mid, 2:high, 3: ultralow, 4: verylow

        let videos: Model.Video[] = [];

        let base = `http://ondemand-${match[1]}.wdr.de/medp/${match[2]}/${match[3]}/${match[4]}/`;

        videos.push({ url: `${base}${qualities[0]}.mp4`, quality: Model.Quality.Low, size: -1 });
        videos.push({ url: `${base}${qualities[1]}.mp4`, quality: Model.Quality.Medium, size: -1 });
        videos.push({ url: `${base}${qualities[2]}.mp4`, quality: Model.Quality.High, size: -1 });
        videos.push({ url: `${base}${qualities[3]}.mp4`, quality: Model.Quality.UltraLow, size: -1 });
        videos.push({ url: `${base}${qualities[4]}.mp4`, quality: Model.Quality.VeryLow, size: -1 });

        return videos;
    }
}

export class BRRewriter implements IUrlRewriter {
    regex: RegExp = /https?:\/\/cdn-vod-ios.br.de\/i\/(.*?),([a-zA-Z0-9,]+),\.mp4\.csmil/;

    canHandle(url: string) {
        return this.regex.test(url);
    }

    rewrite(url: string): Model.Video[] {
        let match = this.regex.exec(url);

        let qualities = match[2].split(',');
        //0:ultralow, 1: verylow, 2:low, 3: mid, 4: high

        let videos: Model.Video[] = [];

        let base = `http://cdn-storage.br.de/${match[1]}/`;

        videos.push({ url: `${base}${qualities[0]}.mp4`, quality: Model.Quality.UltraLow, size: -1 });
        videos.push({ url: `${base}${qualities[1]}.mp4`, quality: Model.Quality.VeryLow, size: -1 });
        videos.push({ url: `${base}${qualities[2]}.mp4`, quality: Model.Quality.Low, size: -1 });
        videos.push({ url: `${base}${qualities[3]}.mp4`, quality: Model.Quality.Medium, size: -1 });
        videos.push({ url: `${base}${qualities[4]}.mp4`, quality: Model.Quality.High, size: -1 });

        return videos;
    }
}
