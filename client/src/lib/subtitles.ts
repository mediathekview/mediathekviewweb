/**
 * Converts broadcaster subtitle files to WebVTT in the browser.
 *
 * The player only understands WebVTT, but the Filmliste `url_subtitle` values are mostly
 * TTML/EBU-TT-D (ARD, ZDF) with the occasional SRT or VTT. The broadcasters serve these with
 * CORS headers, so they can be fetched and converted right here without a server round trip.
 * ORF is the exception: it only allows its own origins, so ORF subtitles fail to load.
 */

const TTML_TIME_CLOCK = /^(?:(\d+):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,3}))?$/;
const TTML_TIME_FRAMES = /^(\d+):(\d{2}):(\d{2}):(\d{1,3})$/;
const TTML_TIME_OFFSET = /^([\d.]+)(h|m|s|ms|f|t)$/;

const SRT_TIMECODE = /(\d{1,3}):(\d{2}):(\d{2})[,.](\d{1,3})\s*-->\s*(\d{1,3}):(\d{2}):(\d{2})[,.](\d{1,3})/;

const DEFAULT_FRAME_RATE = 25;

/** Broadcast-escaped line breaks, e.g. ORF writes `&lt;br/&gt;` into the text instead of a <br/> element. */
const ESCAPED_LINE_BREAK = /<br\s*\/?>/gi;

/** How far the last cue may run past the end of the video before its timing is considered off. */
const DURATION_TOLERANCE_SECONDS = 60;

type Cue = { start: number; end: number; text: string };

export class SubtitleConversionError extends Error {}

/** Formats seconds as the `HH:MM:SS.mmm` timestamp WebVTT expects. */
function formatTimestamp(totalSeconds: number): string {
  // Rounded once up front so a value like 2.9996 becomes 3.000 rather than 2.1000.
  const totalMilliseconds = Math.round(Math.max(0, totalSeconds) * 1000);
  const hours = Math.floor(totalMilliseconds / 3600000);
  const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  const pad = (value: number, length = 2) => value.toString().padStart(length, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

/** Parses a TTML time expression (clock, frame or offset form) into seconds. */
function parseTtmlTime(value: string, frameRate: number): number | null {
  const trimmed = value.trim();

  const frames = TTML_TIME_FRAMES.exec(trimmed);

  if (frames != null) {
    const [, hours, minutes, seconds, frame] = frames;
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(frame) / frameRate;
  }

  const clock = TTML_TIME_CLOCK.exec(trimmed);

  if (clock != null) {
    const [, hours, minutes, seconds, fraction] = clock;
    const fractionSeconds = fraction != undefined ? Number(`0.${fraction}`) : 0;

    return Number(hours ?? 0) * 3600 + Number(minutes) * 60 + Number(seconds) + fractionSeconds;
  }

  const offset = TTML_TIME_OFFSET.exec(trimmed);

  if (offset != null) {
    const amount = Number(offset[1]);

    switch (offset[2]) {
      case 'h': return amount * 3600;
      case 'm': return amount * 60;
      case 's': return amount;
      case 'ms': return amount / 1000;
      case 'f': return amount / frameRate;
      default: return null;
    }
  }

  return null;
}

/**
 * Flattens the content of a TTML <p> into plain text, turning <br/> into a newline and inlining
 * any nested <span>.
 */
function collectText(node: Node, parts: string[]): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType == Node.TEXT_NODE || child.nodeType == Node.CDATA_SECTION_NODE) {
      parts.push((child.nodeValue ?? '').replace(ESCAPED_LINE_BREAK, '\n'));
    } else if (child.nodeType == Node.ELEMENT_NODE) {
      if ((child as Element).localName == 'br') {
        parts.push('\n');
      } else {
        collectText(child, parts);
      }
    }
  }
}

/** WebVTT gives `-->`, `<` and `&` special meaning inside cue payloads. */
function sanitizeCueText(text: string): string {
  return (
    text
      .replace(/\r/g, '')
      .replace(/-->/g, '--→')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim())
      .join('\n')
      // A cue must not contain a blank line - that would terminate it early.
      .replace(/\n{2,}/g, '\n')
      .trim()
  );
}

/**
 * Removes a broadcast timecode offset.
 *
 * Studio subtitle files follow the SMPTE convention of starting the programme at 10:00:00:00 rather
 * than at zero, and several ARD broadcasters (SR, ARD-alpha, and some BR and HR programmes) publish
 * them unchanged. Played against a video starting at zero, such cues would first appear ten hours
 * in - that is, never. The offset is rounded to whole hours so pre-roll cues from 09:59:xx still
 * resolve to a 10 h offset, and it is only removed when the cues would otherwise overrun the video.
 */
function removeTimecodeOffset(cues: Cue[], videoDuration: number | undefined): Cue[] {
  if (cues.length == 0) {
    return cues;
  }

  const earliestStart = Math.min(...cues.map((cue) => cue.start));
  const latestEnd = Math.max(...cues.map((cue) => cue.end));
  const offsetHours = Math.round(earliestStart / 3600);

  if (offsetHours < 1) {
    return cues;
  }

  const fitsVideo = videoDuration != undefined && videoDuration > 0 && latestEnd <= videoDuration + DURATION_TOLERANCE_SECONDS;

  if (fitsVideo) {
    return cues;
  }

  const offset = offsetHours * 3600;

  return cues
    .map((cue) => ({ ...cue, start: Math.max(0, cue.start - offset), end: cue.end - offset }))
    .filter((cue) => cue.end > 0);
}

function cuesToWebVtt(cues: Cue[]): string {
  const blocks = cues
    .filter((cue) => cue.text.length > 0 && cue.end > cue.start)
    .map((cue) => `${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}\n${cue.text}`);

  if (blocks.length == 0) {
    throw new SubtitleConversionError('subtitle contains no usable cues');
  }

  return `WEBVTT\n\n${blocks.join('\n\n')}\n`;
}

/** Reads an attribute by local name, so `ttp:frameRate` is found whatever its prefix. */
function attributeByLocalName(element: Element, localName: string): string | null {
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.localName == localName) {
      return attribute.value;
    }
  }

  return null;
}

function parseTtml(body: string): Cue[] {
  const document = new DOMParser().parseFromString(body, 'application/xml');

  if (document.getElementsByTagName('parsererror').length > 0) {
    throw new SubtitleConversionError('could not parse TTML');
  }

  const root = document.documentElement;

  if (root.localName != 'tt') {
    throw new SubtitleConversionError('TTML document has no <tt> root');
  }

  const frameRate = Number(attributeByLocalName(root, 'frameRate')) || DEFAULT_FRAME_RATE;
  const cues: Cue[] = [];

  // Element names are namespace prefixed in EBU-TT-D (tt:p, tt:div, ...); matching on any
  // namespace handles both prefixed and unprefixed documents.
  for (const paragraph of Array.from(root.getElementsByTagNameNS('*', 'p'))) {
    const begin = paragraph.getAttribute('begin');
    const end = paragraph.getAttribute('end');
    const duration = paragraph.getAttribute('dur');

    if (begin == null) {
      continue;
    }

    const start = parseTtmlTime(begin, frameRate);

    if (start == null) {
      continue;
    }

    let stop: number | null = null;

    if (end != null) {
      stop = parseTtmlTime(end, frameRate);
    } else if (duration != null) {
      const parsedDuration = parseTtmlTime(duration, frameRate);
      stop = parsedDuration == null ? null : start + parsedDuration;
    }

    if (stop == null) {
      continue;
    }

    const parts: string[] = [];
    collectText(paragraph, parts);

    cues.push({ start, end: stop, text: sanitizeCueText(parts.join('')) });
  }

  return cues;
}

function parseSrt(body: string): Cue[] {
  const cues: Cue[] = [];

  for (const block of body.replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    const lines = block.split('\n').filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      continue;
    }

    const timecodeIndex = lines.findIndex((line) => SRT_TIMECODE.test(line));

    if (timecodeIndex < 0) {
      continue;
    }

    const match = SRT_TIMECODE.exec(lines[timecodeIndex])!;
    const toSeconds = (hours: string, minutes: string, seconds: string, milliseconds: string) =>
      Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(milliseconds.padEnd(3, '0')) / 1000;

    cues.push({
      start: toSeconds(match[1], match[2], match[3], match[4]),
      end: toSeconds(match[5], match[6], match[7], match[8]),
      text: sanitizeCueText(lines.slice(timecodeIndex + 1).join('\n')),
    });
  }

  return cues;
}

/**
 * Converts a subtitle file of any supported format to WebVTT.
 *
 * @param videoDuration duration of the video in seconds, used to tell a timecode offset apart from a long programme.
 * @throws {SubtitleConversionError} when the format is unrecognised or yields no usable cues.
 */
export function toWebVtt(body: string, videoDuration?: number): string {
  const sample = body.replace(/^﻿/, '').trimStart();

  if (sample.length == 0) {
    throw new SubtitleConversionError('subtitle is empty');
  }

  if (sample.startsWith('WEBVTT')) {
    return sample;
  }

  let cues: Cue[];

  if (sample.startsWith('<')) {
    cues = parseTtml(sample);
  } else if (SRT_TIMECODE.test(sample)) {
    cues = parseSrt(sample);
  } else {
    throw new SubtitleConversionError('unrecognized subtitle format');
  }

  return cuesToWebVtt(removeTimecodeOffset(cues, videoDuration));
}

/**
 * Fetches a broadcaster subtitle file and returns it as a WebVTT object URL for a <track>.
 * The caller owns the URL and should revoke it once the track is gone.
 */
export async function loadSubtitleAsWebVtt(url: string, videoDuration: number | undefined, signal: AbortSignal): Promise<string> {
  // SR lists its subtitles as protocol-relative URLs (`//www.sr-mediathek.de/...`).
  const response = await fetch(url.replace(/^\/\//, 'https://'), { signal });

  if (!response.ok) {
    throw new SubtitleConversionError(`subtitle request failed with ${response.status}`);
  }

  const webVtt = toWebVtt(await response.text(), videoDuration);

  return URL.createObjectURL(new Blob([webVtt], { type: 'text/vtt' }));
}
