var crypto = require('crypto');

function randomValueBase64(len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4)).toString('base64').slice(0, len).replace(/\+/g, '0').replace(/\//g, '0');
}

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Byte';
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function arraysHasSameElements(arr1, arr2) {
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

var latinDictionary = {
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

function translateToLatin(str) {
    for (let i = 0; i < str.length; i++) {
        let translated = latinDictionary[str[i]];
        if (translated != undefined) {
            str[i] = translated;
        }
    }

    return str;
}

module.exports = {
    randomValueBase64: randomValueBase64,
    formatBytes: formatBytes,
    arraysHasSameElements: arraysHasSameElements,
    latinDictionary: latinDictionary,
};
