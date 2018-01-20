export function random(min: number, max: number, integer: boolean = false) {
    const value = (Math.random() * (max - min)) + min;
    return integer ? Math.round(value) : value;
}