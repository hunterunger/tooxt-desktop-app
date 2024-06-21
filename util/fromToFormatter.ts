import moment from "moment";

export function fromToFormatter(
    from: moment.Moment,
    to: moment.Moment
): string {
    if (from.year() === to.year()) {
        if (from.month() === to.month()) {
            if (from.date() === to.date()) {
                return from.format("MMM Do, YYYY");
            } else {
                return `From ${from.format("MMMM Do")} to ${to.format(
                    "Do, YYYY"
                )}`;
            }
        } else {
            return `From ${from.format("MMM YYYY")} to ${to.format(
                "MMM Do, YYYY"
            )}`;
        }
    } else {
        return `From ${from.format("YYYY")} to ${to.format("MMM Do, YYYY")}`;
    }
}
