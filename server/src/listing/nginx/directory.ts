import * as URL from 'url';
import { AsyncEnumerable } from '../../common/enumerable/async-enumerable';
import { HttpClient } from '../../http';
import { Directory } from '../directory';
import { HttpFile } from '../generic';
import { ResourceType } from '../resource';

const BODY_REGEX = /^<a\s+href="(.*?)"\s?>(.*?)<\/a>\s*(\S+)\s+(\S+)\s+(\S+)/gm;
const SIZE_REGEX = /^(\d+)((?:K|M|G)?)$/;

type ParseResult = { files: HttpFile[], directories: NginxDirectory[] };

export class NginxDirectory implements Directory {
  private fetchPromise: Promise<ParseResult> | undefined;

  private files: HttpFile[] | undefined;
  private directories: NginxDirectory[] | undefined;

  resource: string;
  name: string;
  date: Date;

  constructor(url: string, name: string, date: Date) {
    this.resource = url;
    this.name = name;
    this.date = date;
  }

  async *getFiles(recursive: boolean = false): AsyncIterable<HttpFile> {
    if (this.files == undefined) {
      const result = await this.fetch();
      this.files = result.files;
    }

    yield* this.files;

    if (recursive) {
      const directories = this.getDirectories();

      for await (const directory of directories) {
        yield* directory.getFiles(true);
      }
    }
  }

  async *getDirectories(recursive: boolean = false): AsyncIterable<NginxDirectory> {
    if (this.directories == undefined) {
      const result = await this.fetch();
      this.directories = result.directories;
    }

    yield* this.directories;

    if (recursive) {
      const subDirectories = AsyncEnumerable.from(this.directories)
        .parallelMap(10, true, async (directory) => directory.getDirectories(true))
        .mapMany((directories) => directories);

      yield* subDirectories;
    }
  }

  private async fetch(): Promise<ParseResult> {
    if (this.fetchPromise == undefined) {
      this.fetchPromise = new Promise<ParseResult>(async (resolve, reject) => {
        try {
          const response = await HttpClient.getString(this.resource);
          const result = this.parse(response);

          resolve(result);
        }
        catch (error) {
          reject(error);
        }
      });
    }

    return this.fetchPromise;
  }

  private parse(body: string): ParseResult {
    const regex = new RegExp(BODY_REGEX);
    const matches: RegExpExecArray[] = [];

    let match: RegExpExecArray | null;
    while ((match = regex.exec(body)) !== null) {
      matches.push(match);
    }

    const files: HttpFile[] = [];
    const directories: NginxDirectory[] = [];

    for (const match of matches) {
      const parsedMatch = this.parseMatch(match);

      if (parsedMatch.directory != undefined) {
        directories.push(parsedMatch.directory);
      }

      if (parsedMatch.file != undefined) {
        files.push(parsedMatch.file);
      }
    }

    return {
      files,
      directories
    };
  }

  private parseMatch(match: RegExpExecArray): { directory: NginxDirectory | undefined, file: HttpFile | undefined } {
    const [fullMatch, href, name, date, time, size] = match;

    const url = URL.resolve(this.resource, href);
    const parsedDate = this.parseDate(date, time);

    let directory: NginxDirectory | undefined;
    let file: HttpFile | undefined;

    if (url.endsWith('/')) {
      const slicedName = name.slice(0, -1);
      directory = new NginxDirectory(url, slicedName, parsedDate);
    } else {
      const parsedSize = this.parseSize(size);
      file = new HttpFile({ resource: { uri: url, type: ResourceType.Http }, name: name, size: parsedSize, date: parsedDate });
    }

    return {
      directory,
      file
    };
  }

  private parseDate(dateString: string, timeString: string): Date {
    const timestamp = Date.parse(`${dateString} ${timeString}`);
    const date = new Date(timestamp);

    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date;
  }

  private parseSize(sizeString: string): number {
    const match = sizeString.match(SIZE_REGEX);

    if (match == undefined) {
      throw new Error('sizeString did not match regex');
    }

    const value = parseInt(match[1]);
    const suffix = match[2];

    let result: number;
    switch (suffix) {
      case 'K':
        result = value * 1024;
        break;

      case 'M':
        result = value * 1024 * 1024;
        break;

      case 'G':
        result = value * 1024 * 1024 * 1024;
        break;

      case '':
        result = value;
        break;

      default:
        throw new Error('invalid bytes suffix');
    }

    return result;
  }
}
