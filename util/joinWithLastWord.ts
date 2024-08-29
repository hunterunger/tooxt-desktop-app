export function joinWithLastWord(
    words: string[],
    lastWord: string = "and"
): string {
    if (words.length === 0) {
        return "";
    } else if (words.length === 1) {
        return words[0];
    } else if (words.length === 2) {
        return words.join(` ${lastWord} `);
    } else {
        return (
            words.slice(0, -1).join(", ") +
            `, ${lastWord} ` +
            words[words.length - 1]
        );
    }
}
