import fs from 'node:fs';

import { Batch } from '@valkey/valkey-glide';
import lineReader from 'line-reader';

import { IPC } from './IPC';
import { getValkeyClient, initializeValkey } from './ValKey';
import { formatPercent } from './utils';

const ipc = new IPC(process);

function handleError(err) {
  ipc.send('error', err.message);
  setTimeout(() => process.exit(0), 500);
}

ipc.on('parseFilmliste', async (options) => {
  await initializeValkey();
  parseFilmliste(options.file, options.setKey, options.timestampKey);
});

function createUrlFromBase(baseUrl, newUrl) {
  const newSplit = newUrl.split('|');
  if (newSplit.length == 2) {
    return baseUrl.substr(0, newSplit[0]) + newSplit[1];
  }
  return '';
}

const handleListMeta = (line: string) => {
  const regex = /".*?","(\d+)\.(\d+)\.(\d+),\s?(\d+):(\d+)"/;
  const match = regex.exec(line);

  if (!match) {
    return 0;
  }

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

const mapListLineToValkey = ({ line, currentChannel, currentTopic }) => {
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
    {
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
    }
  ]
}

function parseFilmliste(file, setKey, timestampKey) {
  const valkey = getValkeyClient();

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

      let currentChannel;
      let currentTopic;
      let entry;
      let buffer: string[] = [];
      let currentLine = 0;

      const filesize = stats.size,
        fileStream = fs.createReadStream(null, { fd: fd, autoClose: true }),
        lineReaderSeparator = { separator: /^{"Filmliste":|,"X":|}$/ }

      const getProgress = () => {
        return filesize > 0 ? fileStream.bytesRead / filesize : 1;
      };

      lineReader.eachLine(fileStream as any, lineReaderSeparator, (line, last, getNext) => {
        currentLine++;

        if (currentLine === 1) {
          // This is the empty string before the first separator, skip.
        }
        else if (currentLine === 2) {
          // This is the metadata line
          valkey.set(timestampKey, handleListMeta(line).toString());
        }
        else {
          // This is a data line, process it.
          // An empty line can be passed on the last call, so guard against it.
          if (line.length > 0) {
            [currentChannel, currentTopic, entry] = mapListLineToValkey({ line, currentChannel, currentTopic });

            const isBlacklisted = entry.title == 'Wir haben genug - Wirtschaft ohne Wachstum';

            if (!isBlacklisted) {
              const jsonEntry = JSON.stringify(entry);
              buffer.push(jsonEntry);
            }
          }
        }

        // Flush buffer periodically, or on the last line if the buffer has contents.
        const shouldFlush = (buffer.length >= 500 && !last) || (last && buffer.length > 0);

        if (shouldFlush) {
          const batch = new Batch(false);

          for (const jsonEntry of buffer) {
            batch.sadd(setKey, [jsonEntry]);
          }

          buffer = [];

          valkey.exec(batch, true).then(() => {
            ipc.send('state', {
              entries: currentLine - 2,
              progress: formatPercent(getProgress())
            });

            if (last) {
              ipc.send('done');
              fs.close(fd, () => setTimeout(() => process.exit(0), 500));
            }
            else {
              getNext();
            }
          }).catch(err => {
            handleError(err);
            fs.close(fd, () => process.exit(1));
          });

          return;
        }

        if (last) {
          // This handles the case where the last line is reached but the buffer was empty.
          // We still need to finalize and close.
          ipc.send('state', {
            entries: Math.max(0, currentLine - 2),
            progress: 1
          });
          ipc.send('done');
          fs.close(fd, () => setTimeout(() => process.exit(0), 500));
          return;
        }

        getNext();
      });
    });
  });
}
