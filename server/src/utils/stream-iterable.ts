import { Readable } from 'stream';

export class StreamIterable<T> implements AsyncIterable<T> {
    private stream: Readable;
    private readSize: number;

    private end: boolean = false;
    private readablePromise: Promise<void>;
    private readableResolve: () => void;
    private readableReject: (error: Error) => void;

    constructor(stream: Readable, readSize: number) {
        this.stream = stream;
        this.readSize = readSize;

        this.resetPromise();
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        this.stream
            .on('readable', () => this.handleReadable())
            .on('end', () => this.handleEnd())
            .on('error', (error: Error) => this.handleError(error));

        while (!this.end) {
            await this.readablePromise;

            let chunk;
            while ((chunk = this.stream.read(this.readSize)) != null) {
                yield chunk;
            }

            this.resetPromise();
        }
    }

    private resetPromise() {
        this.readablePromise = new Promise((resolve) => this.readableResolve = resolve);
    }

    private handleReadable() {
        this.readableResolve();
    }

    private handleEnd() {
        this.end = true;
        this.readableResolve();
    }

    private handleError(error: Error) {
        this.readableReject(error);
    }
}
