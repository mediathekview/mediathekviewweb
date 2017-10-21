"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function random(min, max, integer = false) {
    const value = (Math.random() * (max - min)) + min;
    return integer ? Math.floor(value) : value;
}
exports.random = random;
function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), ms);
    });
}
exports.sleep = sleep;
