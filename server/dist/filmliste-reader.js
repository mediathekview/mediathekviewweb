"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Byline = require("byline");
const Stream = require("stream");
class FilmlisteTransform extends Stream.Transform {
    constructor() {
        super({ readableObjectMode: true, writableObjectMode: true });
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
                this.lineStream = Byline.createStream(this.fileStream);
                this.emit('ready');
            });
        });
        Byline.createStream();
    }
    transform() {
    }
}
exports.FilmlisteTransform = FilmlisteTransform;
//# sourceMappingURL=filmliste-reader.js.map