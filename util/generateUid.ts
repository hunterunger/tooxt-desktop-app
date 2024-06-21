export function generateUid(length = 10) {
    return Math.random().toString(36).substr(2, length);
}
