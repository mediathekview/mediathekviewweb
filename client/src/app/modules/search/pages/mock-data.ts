import { MediaType, PublicEntry } from "src/app/shared/models";
import { getRandomString } from '@tstdl/base/utils';

export function getEntry(): PublicEntry {
  return {
    id: getRandomString(10),
    channel: 'ARD',
    topic: 'Sturm der Liebe',
    title: 'Zwei Rivalen im Gespräch? (3354)',
    timestamp: 1585934700,
    duration: 2852,
    description: 'Charlotte kann Friedrich zwar beruhigen - doch als er erfährt, dass sie mit Werner dessen "Rückkehr" in den "Fürstenhof" feiern will, reagiert er eifersüchtig. Friedrichs Versuch, das Rendezvous zu stören, scheitert. An der Bar trifft der gedemütigte Friedrich dann auf die ebenfalls trostbedürftige Natascha. Beide helfen sich ein wenig aus ihrem Gefühlssumpf, wobei sich Natascha als bezaubernde Co\n.....',
    website: 'https://www.ardmediathek.de/ard/player/Y3JpZDovL3dkci5kZS9CZWl0cmFnLWQ4ZGY0NTAwLTViYzAtNDZhMC1iODk2LTExYWZlMmViMWU5ZQ',
    firstSeen: 3670983,
    lastSeen: 45678765,
    media: [
      {
        type: MediaType.Video,
        url: 'http://wdrmedien-a.akamaihd.net/medp/ondemand/de/fsk0/213/2136543/2136543_26549447.mp4',
        size: 744488960,
        quality: {
          resolution: {
            width: 1920,
            height: 1080
          },
          bitrate: 123456
        }
      }
    ],
    date: getDateTimestamp(1585934700),
    time: 1585934700 % 86400000,
    metadata: {
      downloads: 713,
      plays: 6088,
      comments: 76,
      averageRating: 4.5,
      secondsPlayed: 787654345,
      secondsPaused: 234567
    }
  };
}

function getDateTimestamp(timestamp: number): number {
  const date = new Date(timestamp * 1000);
  const dateWithoutTime = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  return Math.floor(dateWithoutTime.valueOf() / 1000);
}
