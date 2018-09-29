import os from 'os';

export function randomValueBase64(length: number) {
    return crypto.randomBytes(Math.ceil(length * 3 / 4)).toString('base64').slice(0, length).replace(/\+/g, '0').replace(/\//g, '0');
}

export function getUniqueID() {
    //a hopefully unique ID.
    return Math.floor(Math.random() * 10000000).toString() + process.pid.toString() + os.freemem().toString() + Date.now().toString() + Math.floor(os.uptime()).toString();
}

export function formatBytes(bytes: number, decimals: number) {
    if (bytes == 0) return '0 Byte';
    const k = 1000;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function timeout(): Promise<void>;
export function timeout(milliseconds: number): Promise<void>;
export function timeout(milliseconds: number = 0): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export function arraysHasSameElements(array1: any[], array2: any[]) {
    if (array1.length != array2.length) {
        return false;
    }

    array1 = array1.sort();
    array2 = array2.sort();

    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }

    return true;
}

const latinDictionary: { [key: string]: string } = {
    'ä': 'ae',
    'ö': 'oe',
    'ü': 'ue',
    'ù': 'u',
    'û': 'u',
    'ÿ': 'y',
    'à': 'a',
    'â': 'a',
    'æ': 'ae',
    'ç': 'c',
    'é': 'e',
    'è': 'e',
    'ê': 'e',
    'ë': 'e',
    'ï': 'i',
    'î': 'i',
    'ô': 'o',
    'œ': 'oe',
    'ß': 'ss'
};

export function translateToLatin(value: string & { [key: number]: string }) {
    for (let i = 0; i < value.length; i++) {
        let translated = latinDictionary[value[i]];
        if (translated != undefined) {
            value[i] = translated;
        }
    }

    return value;
}