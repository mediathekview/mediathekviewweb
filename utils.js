var crypto = require('crypto');

function randomValueBase64(len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4)).toString('base64').slice(0, len).replace(/\+/g, '0').replace(/\//g, '0');
}

function formatBytes(bytes, decimals) {
   if(bytes == 0) return '0 Byte';
   var k = 1000;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

module.exports = {"randomValueBase64": randomValueBase64, "formatBytes": formatBytes};
