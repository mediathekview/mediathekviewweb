import * as crypto from 'crypto';
import * as os from 'os';

function randomValueBase64(len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4)).toString('base64').slice(0, len).replace(/\+/g, '0').replace(/\//g, '0');
}

function getUniqueID() {
    //a hopefully unique ID.
    return Math.floor(Math.random() * 10000000).toString() + process.pid.toString() + os.freemem().toString() + Date.now().toString() + Math.floor(os.uptime()).toString();
}

function formatBytes(bytes: number, decimals: number) {
    if (bytes < 1) return `{bytes} Byte`;
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}

function arraysHasSameElements<T>(arr1: Array<T>, arr2: Array<T>) {
    if (arr1.length != arr2.length) {
        return false;
    }

    arr1 = arr1.sort();
    arr2 = arr2.sort();

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

var latinDictionary: { [key: string]: string } = {
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

function translateToLatin(str: string) {
    for (let i = 0; i < str.length; i++) {
        let translated = latinDictionary[str[i]];
        if (translated != undefined) {
            str[i] = translated;
        }
    }

    return str;
}
