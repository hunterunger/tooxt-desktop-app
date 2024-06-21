export default function gramaticalJoin(
    items: string[],
    separator: string = ", ",
    lastSeparator: string = " and "
): string {
    if (items.length === 0) {
        return "";
    }

    if (items.length === 1) {
        return items[0];
    }

    if (items.length === 2) {
        return items.join(lastSeparator);
    }

    return (
        items.slice(0, -1).join(separator) +
        lastSeparator +
        items[items.length - 1]
    );
}
