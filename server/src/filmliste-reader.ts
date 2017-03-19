import * as Model from './model';
import * as FS from 'fs';
import * as Byline from 'byline';
import * as Stream from 'stream';
import * as Crypto from 'crypto';
import { IUrlRewriter, WDRRewriter } from './url-rewriter';


export class FilmlisteReader extends Stream.Readable {
    size: number;
    fileStream: FS.ReadStream;
    lineStream: Byline.LineStream;
    urlRewriters: IUrlRewriter[];

    private currentLine: number = 0;
    private currentChannel: string = '';
    private currentTopic: string = '';
    private headerRegex = /".*?",\s"(\d+)\.(\d+)\.(\d+),\s?(\d+):(\d+)"/;

    constructor(file: string, ...urlRewriters: IUrlRewriter[]) {
        super({ objectMode: true, highWaterMark: 100 });
        this.urlRewriters = urlRewriters;

        FS.open(file, 'r', (err, fd) => {
            if (err) {
                this.emit('error', err);
            }

            FS.fstat(fd, (err, stats) => {
                if (err) {
                    this.emit('error', err);
                }

                this.size = stats.size;

                this.fileStream = FS.createReadStream(null, { fd: fd, autoClose: true });
                this.lineStream = Byline.createStream(this.fileStream, { highWaterMark: 100 });

                this.emit('ready');
            });
        });
    }

    _read() {
        let line: string;

        while (null !== (line = this.lineStream.read())) {
            this.currentLine++;

            if (this.currentLine > 4) {
                super.push(this.parseLine(line));
            } else if (this.currentLine == 2) {
                let match = this.headerRegex.exec(line);
                let timestamp = Math.floor(Date.UTC(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]), parseInt(match[4]), parseInt(match[5])) / 1000);
                this.emit('filmlisteTimestamp', timestamp);
            }
        }
    }

    parseLine(line: string): Model.Entry {
        if (line[line.length - 1] == ',') {
            line = line.slice(8, -1); //8 is begin of array
        } else {
            line = line.slice(8);
        }

        let parsed = JSON.parse(line);

        if (parsed[0].length == 0) {
            parsed[0] = this.currentChannel;
        } else {
            this.currentChannel = parsed[0];
        }
        if (parsed[1].length == 0) {
            parsed[1] = this.currentTopic;
        } else {
            this.currentTopic = parsed[1];
        }

        let durationSplit: string = parsed[5].split(':');
        let duration: number = (parseInt(durationSplit[0]) * 60 * 60) + (parseInt(durationSplit[1]) * 60) + parseInt(durationSplit[2]);
        let url_video = parsed[8];
        let url_video_low = this.createUrlFromBase(url_video, parsed[12]);
        let url_video_hd = this.createUrlFromBase(url_video, parsed[14]);
        let url_video_size = parseInt(parsed[6]) * 1000000;

        let videos: Model.Video[] = [];

        for (let i = 0; i < this.urlRewriters.length; i++) {
            let rewriter = this.urlRewriters[i];

            if (rewriter.canHandle(url_video)) {
                videos = rewriter.rewrite(url_video);
                break;
            }
        }

        if (videos.length == 0) {
            videos.push({ url: url_video, size: url_video_size, quality: Model.Quality.Medium });

            if (url_video_low != null) {
                videos.push({ url: url_video_low, size: -1, quality: Model.Quality.Low });
            }
            if (url_video_hd != null) {
                videos.push({ url: url_video_hd, size: -1, quality: Model.Quality.High });
            }
        }

        let entry: Model.Entry = {
            channel: parsed[0],
            topic: parsed[1],
            title: parsed[2],
            description: parsed[7],
            timestamp: parseInt(parsed[16]) | -1,
            duration: duration,
            videos: videos,
            website: parsed[9]
        };

        entry.id = this.md5(JSON.stringify(entry));

        return entry;
    }

    md5(stringOrBuffer: string | Buffer) {
        return Crypto.createHash('md5').update(stringOrBuffer).digest('base64').slice(0, -2);
    }

    createUrlFromBase(base: string, appendix: string) {
        let appendixSplit = appendix.split('|');
        if (appendix.length == 2) {
            return base.substr(0, parseInt(appendixSplit[0])) + appendixSplit[1];
        } else {
            return null;
        }
    }

}
