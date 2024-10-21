import moment from "moment";
import { MockMessageBubbleHtml } from "./MockMessageBubblePdf";
import "./styles.css";
import { useEffect, useRef } from "react";
import { ProjectType } from "@/ts/dataTypes";

export default function ChatHistoryHtml(props: {
    project: ProjectType;
    samplePdf?: boolean;
    setEstimatedPages?: (pages: number) => void;
}) {
    const { project } = props;

    const pagePaperSize = { width: 360, height: 504 }; // 5x7 inches @ 72dpi

    const interiorPagesRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const totalHeight = interiorPagesRef.current?.scrollHeight || 0;

        const estimatedPages =
            Math.ceil(totalHeight / pagePaperSize.height) + 3 + 1; // covers + 3 extra pages

        console.log("estimated pages", estimatedPages);
        if (props.setEstimatedPages) props.setEstimatedPages(estimatedPages);
    }, []);

    return (
        <div
            className="interiorPages"
            ref={interiorPagesRef}
            style={pagePaperSize}
        >
            {project.uncompressedChatroom?.messages.map((message, i) => (
                <MesageContainer
                    key={i}
                    message={message}
                    project={project}
                    i={i}
                />
            ))}
        </div>
    );
}

function MesageContainer(props: {
    message: any;
    project: ProjectType;
    i: number;
}) {
    const { message, i } = props;

    if (message.text === null && message.attachments.length === 0) {
        return null;
    }
    // check if the previous message was sent on the same day
    // if so, don't display the date again
    let showDate = true;
    const prevMessage = props.project.uncompressedChatroom?.messages[i - 1];
    if (prevMessage) {
        const prevDate = new Date(prevMessage.date_str);
        const currDate = new Date(message.date_str);
        showDate = prevDate.toDateString() != currDate.toDateString();
    }

    // add a space between messages sent more than an hour apart
    let moreThanOneHour = false;
    if (prevMessage) {
        const prevDate = new Date(prevMessage.date_str);
        const currDate = new Date(message.date_str);
        moreThanOneHour =
            currDate.getTime() - prevDate.getTime() > 60 * 60 * 1000;
    }

    // display name
    const thisContactIndex =
        props.project.uncompressedChatroom?.participants?.findIndex(
            (participant) => participant == message.from_address
        );

    const selfDisplayName = props.project.contactAliases?.[-1];

    let displayname =
        thisContactIndex !== undefined
            ? props.project.contactAliases?.[thisContactIndex]
            : undefined;

    if (message.is_from_me && selfDisplayName) {
        displayname = selfDisplayName;
    }

    if (!displayname) {
        displayname = message.from_address.split(" ")[0];
    }
    const msgDiv = (
        <div key={i} className="messageContainer">
            {showDate && (
                <p className="dateLabel">
                    {moment(new Date(message.date_str)).format(
                        "ddd, MMM D, YYYY"
                    )}
                </p>
            )}
            {moreThanOneHour && !showDate && <div className="timeGap" />}
            <MockMessageBubbleHtml
                message={message}
                projectId={props.project.id}
                displayname={
                    message.is_from_me ? displayname || "Me" : displayname
                }
            />
        </div>
    );
    return msgDiv;
}
