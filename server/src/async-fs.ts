// Project: https://github.com/davetemplin/async-file/
// Written by: Dave Templin <https://github.com/davetemplin/>

/*
The MIT License (MIT)

Copyright (c) 2016 Dave Templin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as fs from 'fs';
import * as pathutil from 'path';

export {
  createReadStream,
  createWriteStream,
  watch,
  watchFile,
  unwatchFile,
  Stats,
  FSWatcher,
  ReadStream,
  WriteStream,
  constants
} from 'fs';

export function access(path: string, mode?: number | string): Promise<void> { return thunk<void>(fs.access, arguments); }
export function appendFile(file: string | number, data: any, options?: { encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8'; mode?: number | string; flag?: 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+'; }): Promise<void> { return thunk<void>(fs.appendFile, arguments); }
export function chmod(path: string, mode: number | string): Promise<void> { return thunk<void>(fs.chmod, arguments); }
export function chown(path: string, uid: number, gid: number): Promise<void> { return thunk<void>(fs.chown, arguments); }
export function close(fd: number): Promise<void> { return thunk<void>(fs.close, arguments); }
export function fchmod(fd: number, mode: number | string): Promise<void> { return thunk<void>(fs.fchmod, arguments); }
export function fchown(fd: number, uid: number, gid: number): Promise<void> { return thunk<void>(fs.fchown, arguments); }
export function fstat(fd: number): Promise<fs.Stats> { return thunk<fs.Stats>(fs.fstat, arguments); }
export function ftruncate(fd: number, len?: number): Promise<void> { return thunk<void>(fs.ftruncate, arguments); }
export function futimes(fd: number, atime: Date | number, mtime: Date | number): Promise<void> { return thunk<void>(fs.futimes, arguments); }
export function fsync(fd: number): Promise<void> { return thunk<void>(fs.fsync, arguments); }
export function lchmod(path: string, mode: number | string): Promise<void> { return thunk<void>(fs.lchmod, arguments); }
export function lchown(path: string, uid: number, gid: number): Promise<void> { return thunk<void>(fs.lchown, arguments); }
export function link(srcpath: string, dstpath: string): Promise<void> { return thunk<void>(fs.link, arguments); }
export function lstat(path: string): Promise<fs.Stats> { return thunk<fs.Stats>(fs.lstat, arguments); }
export function mkdir(path: string, mode?: number | string): Promise<void> { return thunk<void>(fs.mkdir, arguments); }
export function mkdtemp(path: string): Promise<string> { return thunk<string>((fs as any).mkdtemp, arguments); }
export function open(path: string, flags: 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+', mode?: number | string): Promise<number> { return thunk<number>(fs.open, arguments); }
export function read(fd: number, buffer: Buffer, offset: number, length: number, position: number): Promise<{ bytesRead: number; buffer: Buffer; }> { return thunk<{ bytesRead: number; buffer: Buffer; }>(fs.read, arguments, null, function () { return { bytesRead: <number>arguments[1], buffer: <Buffer>arguments[2] }; }); }
export function readdir(path: string): Promise<string[]> { return thunk<string[]>(fs.readdir, arguments); }
export function readFile(file: string | number,
  options?: {
    encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8';
    flag?: 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+';
  }
    | 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8' | 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+'
): Promise<any> { return thunk<any>(fs.readFile, arguments); }
export function readlink(path: string): Promise<string> { return thunk<string>(fs.readlink, arguments); }
export function realpath(path: string, cache?: { [path: string]: string }): Promise<string> { return thunk<string>(fs.realpath, arguments); }
export function rename(oldPath: string, newPath: string): Promise<void> { return thunk<void>(fs.rename, arguments); }
export function rmdir(path: string): Promise<void> { return thunk<void>(fs.rmdir, arguments); }
export function stat(path: string): Promise<fs.Stats> { return thunk<fs.Stats>(fs.stat, arguments); }
export function symlink(srcpath: string, dstpath: string, type?: string): Promise<void> { return thunk<void>(fs.symlink, arguments); }
export function truncate(path: string, len?: number): Promise<void> { return thunk<void>(fs.truncate, arguments); }
export function unlink(path: string): Promise<void> { return thunk<void>(fs.unlink, arguments); }
export function utimes(path: string, atime: Date | number, mtime: Date | number): Promise<void> { return thunk<void>(fs.utimes, arguments); }
export function write(fd: number, buffer: Buffer, offset: number, length: number, position?: number): Promise<{ written: number; buffer: Buffer }>;
export function write(fd: number, data: any, offset?: number, encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8'): Promise<{ written: number; buffer: Buffer }>;
export function write(fd: number): Promise<{ written: number; buffer: Buffer; }> { return thunk<{ written: number; buffer: Buffer }>(fs.write, arguments, null, function () { return { written: <number>arguments[1], buffer: <Buffer>arguments[2] }; }); }

export function writeFile(file: string | number, data: string | any,
  options?: {
    encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8';
    flag?: 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+';
    mode?: number | string
  }
    | 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8' | 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+'
): Promise<void> { return thunk<any>(fs.writeFile, arguments); }



export function readTextFile(file: string | number, encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8', flags?: 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+'): Promise<string> {
  if (encoding === undefined)
    encoding = 'utf8';
  if (flags === undefined || flags === null)
    flags = 'r';
  return thunk<string>(fs.readFile, [file, { encoding: encoding, flags: flags }]);
}

export function writeTextFile(file: string | number, data: string, encoding?: 'ascii' | 'base64' | 'binary' | 'hex' | 'ucs2' | 'utf16le' | 'utf8', flags?: 'r' | 'r+' | 'rs' | 'rs+' | 'w' | 'wx' | 'w+' | 'wx+' | 'a' | 'ax' | 'a+' | 'ax+', mode?: number | string): Promise<void> {
  if (encoding === undefined)
    encoding = 'utf8';
  if (flags === undefined || flags === null)
    flags = 'w';
  var options = { encoding: encoding, flags: flags, mode: mode };
  if (flags[0] === 'a')
    return thunk<any>(fs.appendFile, [file, data, options]);
  else
    return thunk<any>(fs.writeFile, [file, data, options]);
}

export function createDirectory(path: string, mode?: number | string): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    mkdirp(path, mode, err =>
      !err ? resolve() : reject(err)));
}
export { createDirectory as mkdirp };

export function exists(path: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) =>
    fs.lstat(path, (err: NodeJS.ErrnoException) =>
      !err ? resolve(true) : err.code === 'ENOENT' ? resolve(false) : reject(err)));
}

function mkdirp(path: string, mode: number | string | undefined, done: { (err: Error | null): void }): void {
  path = pathutil.resolve(path);
  fs.mkdir(path, <string>mode, (err: NodeJS.ErrnoException) => {
    if (!err)
      done(null);
    else if (err.code === 'ENOENT')
      mkdirp(pathutil.dirname(path), mode, err =>
        !err ? mkdirp(path, mode, done) : done(err));
    else
      fs.stat(path, (err: Error, stat: { isDirectory: { (): boolean } }) =>
        err ? done(err) : !stat.isDirectory() ? done(new Error(path + ' is already a file')) : done(null));
  });
}

function thunk<T>(target: Function, args: any[] | IArguments, context?: any, resolver?: { (): T }): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    target.apply(context, Array.prototype.slice.call(args).concat([function (err: Error, result: T) {
      if (err)
        reject(err);
      else if (resolver)
        resolver.apply(context, arguments);
      else
        resolve(result);
    }]));
  });
}
