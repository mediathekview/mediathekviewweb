const REDIS = require('redis');
const lineReader = require('line-reader');
const fs = require('fs');
const config = require('./config.js');
const IPC = require('./IPC.js');

var redis = REDIS.createClient(config.redis);
var ipc = new IPC(process);

function handleError(err) {
    ipc.send('error', err.message);
    redis.quit();
    setTimeout(() => process.exit(0), 500);
}

redis.on('error', (err) => {
    handleError(err);
});

ipc.on('parseFilmliste', (options) => {
    console.log(options);
    parseFilmliste(options.file, options.setKey, options.timestampKey);
});

function createUrlFromBase(baseUrl, newUrl) {
    let newSplit = newUrl.split('|');
    if (newSplit.length == 2) {
        return baseUrl.substr(0, newSplit[0]) + newSplit[1];
    } else {
        return '';
    }
}

function parseFilmliste(file, setKey, timestampKey) {
    fs.open(file, 'r', (err, fd) => {
        if (err) {
            handleError(err);
        } else {
            fs.fstat(fd, (err, stats) => {
                if (err) {
                    handleError(err);
                } else {
                    let filesize = stats.size;

                    let fileStream = fs.createReadStream(null, {
                        fd: fd,
                        autoClose: true
                    });

                    let getProgress = () => {
                        return fileStream.bytesRead / filesize;
                    };

                    let buffer = [];
                    let entries = 0;
                    let currentChannel;
                    let currentTopic;
                    let currentLine = 0;

                    lineReader.eachLine(fileStream, (line, last, getNext) => {
                        currentLine++;

                        if (currentLine == 2) {
                            let regex = /".*?",\s"(\d+)\.(\d+)\.(\d+),\s?(\d+):(\d+)"/;
                            let match = regex.exec(line);
                            let timestamp = Math.floor(Date.UTC(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]), parseInt(match[4]), parseInt(match[5])) / 1000);

                            redis.set(timestampKey, timestamp);
                        } else if (currentLine >= 4 && !last) {
                            if (line[line.length - 1] == ',') {
                                line = line.slice(8, -1); //8 is begin of array
                            } else {
                                line = line.slice(8);
                            }

                            let parsed = JSON.parse(line);

                            if (parsed[0].length == 0) {
                                parsed[0] = currentChannel;
                            } else {
                                currentChannel = parsed[0];
                            }
                            if (parsed[1].length == 0) {
                                parsed[1] = currentTopic;
                            } else {
                                currentTopic = parsed[1];
                            }

                            durationSplit = parsed[5].split(':');
                            let entry = {
                                channel: parsed[0],
                                topic: parsed[1],
                                title: parsed[2],
                                description: parsed[7],
                                timestamp: parseInt(parsed[16]),
                                duration: (parseInt(durationSplit[0]) * 60 * 60) + (parseInt(durationSplit[1]) * 60) + parseInt(durationSplit[2]),
                                size: parseInt(parsed[6]) * 1000000, //MB to bytes
                                url_website: parsed[9],
                                url_subtitle: parsed[10],
                                url_video: parsed[8],
                                url_video_low: createUrlFromBase(parsed[8], parsed[12]),
                                url_video_hd: createUrlFromBase(parsed[8], parsed[14])
                            };

                            buffer.push(['sadd', setKey, JSON.stringify(entry)]);
                            entries++;

                            if (currentLine % 500 == 0) {
                                redis.batch(buffer).exec();
                                buffer = [];
                                ipc.send('state', {
                                    entries: entries,
                                    progress: getProgress()
                                });
                            }
                        } else if (last) {
                            redis.batch(buffer).exec(() => {
                                ipc.send('state', {
                                    entries: entries,
                                    progress: 1
                                });
                                ipc.send('done');

                                fs.close(fd, () => {
                                    setTimeout(() => process.exit(0), 500);
                                });
                            });
                        }

                        getNext();
                    });
                }
            });
        }
    });


}
