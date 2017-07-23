const REDIS = require('redis');
const fs = require('fs');
const lineReader = require('line-reader');

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
  }
  return '';
}

const handleListMeta = ({
  line
}) => {
  let regex = /".*?","(\d+)\.(\d+)\.(\d+),\s?(\d+):(\d+)"/;
  let match = regex.exec(line);
  return Math.floor(
    Date.UTC(
      parseInt(match[3]),
      parseInt(match[2]) - 1,
      parseInt(match[1]),
      parseInt(match[4]),
      parseInt(match[5])
    ) / 1000
  );
}

function parseFilmliste(file, setKey, timestampKey) {
  fs.open(file, 'r', (err, fd) => {
    if (err) {
      handleError(err);
      return;
    }

    fs.fstat(fd, (err, stats) => {
      if (err) {
        handleError(err);
        return;
      }

      let filesize = stats.size;

      let fileStream = fs.createReadStream(null, {
        fd: fd,
        autoClose: true
      });

      let getProgress = () => {
        return fileStream.bytesRead / filesize;
      };

      let buffer = [];
      let currentChannel;
      let currentTopic;
      let currentLine = 0;

      const lineReaderOpts = {
        separator: /^{"Filmliste":|,"X":|}$/
      }

      lineReader.eachLine(fileStream, lineReaderOpts, (line, last, getNext) => {
        if (last) {
          return redis.batch(buffer).exec(() => {
            ipc.send('state', {
              entries: currentLine - 2,
              progress: 1
            });
            ipc.send('done');
            fs.close(fd, () => setTimeout(() => process.exit(0), 500));
          });
        }

        currentLine++;

        if (currentLine === 1) {
          return getNext();
        }
        if (currentLine === 2) {
          redis.set(timestampKey, handleListMeta({
            line
          }));
          return getNext();
        }

        // destruct parsed
        const [
          line_channel,
          line_topic,
          title,
          ,
          ,
          hr_duration,
          size,
          description,
          url_video,
          url_website,
          url_subtitle,
          ,
          url_video_low,
          ,
          url_video_hd,
          ,
          timestamp
        ] = JSON.parse(line);

        currentChannel = (line_channel.length == 0) ? currentChannel : line_channel;
        currentTopic = (line_topic.length == 0) ? currentTopic : line_topic;

        const [hours, minutes, seconds] = hr_duration.split(':');
        const entry = {
          channel: currentChannel,
          topic: currentTopic,
          title,
          description,
          timestamp: parseInt(timestamp) | 0,
          duration: (parseInt(hours) * 60 * 60) + (parseInt(minutes) * 60) + parseInt(seconds),
          size: parseInt(size) * 1024 * 1024, //MB to bytes
          url_website,
          url_subtitle,
          url_video,
          url_video_low: createUrlFromBase(url_video, url_video_low),
          url_video_hd: createUrlFromBase(url_video, url_video_hd)
        };

        buffer.push(['sadd', setKey, JSON.stringify(entry)]);

        if (currentLine % 500 == 0) {
          redis.batch(buffer).exec();
          buffer = [];
          ipc.send('state', {
            entries: currentLine - 2,
            progress: getProgress()
          });
        }

        getNext();
      });
    });
  });
}
