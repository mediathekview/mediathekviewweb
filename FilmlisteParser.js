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
  const newSplit = newUrl.split('|');
  if (newSplit.length == 2) {
    return baseUrl.substr(0, newSplit[0]) + newSplit[1];
  }
  return '';
}

const handleListMeta = ({line}) => {
  const regex = /".*?","(\d+)\.(\d+)\.(\d+),\s?(\d+):(\d+)"/;
  const match = regex.exec(line);
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

const mapListLineToRedis = ({line, currentChannel, currentTopic}) => {
  // destruct parsed
  const [
    line_channel,    // 0
    line_topic,      // 1
    title,           // 2
    ,                // 3
    ,                // 4
    hr_duration,     // 5
    size,            // 6
    description,     // 7
    url_video,       // 8
    url_website,     // 9
    url_subtitle,    // 10
    ,                // 11
    url_video_low,   // 12
    ,                // 13
    url_video_hd,    // 14
    ,                // 15
    timestamp        // 16
  ] = JSON.parse(line);

  currentChannel = (line_channel.length == 0) ? currentChannel : line_channel;
  currentTopic = (line_topic.length == 0) ? currentTopic : line_topic;

  const duration = hr_duration.split(':').reverse().reduce((a, b, index) => (
    (index === 1) 
      ? parseInt(a) + parseInt(b) * 60 
      : parseInt(b) * (Math.pow(60, index)) + a
  ));
  return [
    currentChannel,
    currentTopic,
    JSON.stringify({
      channel: currentChannel,
      topic: currentTopic,
      title,
      description,
      timestamp: parseInt(timestamp) | 0,
      duration,
      size: parseInt(size) * 1024 * 1024, //MB to bytes
      url_website,
      url_subtitle,
      url_video,
      url_video_low: createUrlFromBase(url_video, url_video_low),
      url_video_hd: createUrlFromBase(url_video, url_video_hd)
    })
  ]
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

      let currentChannel,
          currentTopic,
          buffer = [],
          currentLine = 0;

      const filesize = stats.size,
            fileStream = fs.createReadStream(null, {fd: fd, autoClose: true}),
            lineReaderSeparator = {separator: /^{"Filmliste":|,"X":|}$/}

      const getProgress = () => {
        return fileStream.bytesRead / filesize;
      };

      lineReader.eachLine(fileStream, lineReaderSeparator, (line, last, getNext) => {
        currentLine++;
        if (currentLine === 1) {
          return getNext();
        }
        if (currentLine === 2) {
          redis.set(timestampKey, handleListMeta({line}));
          return getNext();
        }

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

        [currentChannel, currentTopic, entry] = mapListLineToRedis({line, currentChannel, currentTopic})
        buffer.push(['sadd', setKey, entry]);

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
