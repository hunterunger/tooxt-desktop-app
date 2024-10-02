import { IconFile } from "@tabler/icons-react";
import "./styles.css";
import { bubbleColourFromService } from "@/util/bubbleColours";
import { MessageType } from "@/ts/messageTypes";

export function MockMessageBubbleHtml(props: {
    message: MessageType;
    projectId: string;
    displayname?: string;
}) {
    const { message } = props;

    // message.date_str is formatted like "Mar 08, 2024 3:23:21 PM"
    // convert to date
    const date = new Date(message.date_str);

    // format with just the time like "3:30pm"
    const timeStr = new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    // const totalValidAttachments = message.attachments.filter(
    //     (attachment) => !attachment.hide_attachment
    // ).length;

    const radius = 10;

    return (
        <div
            className={`bubbleContainer ${
                message.is_from_me ? "fromMe" : "fromThem"
            }`}
        >
            <div
                className="bubble"
                style={{
                    backgroundColor: message.is_from_me
                        ? bubbleColourFromService(message.service)
                        : "#f0f2f7",
                    color: message.is_from_me ? "white" : "black",
                }}
            >
                {message.attachments.map((attachment, i) => {
                    if (attachment.hide_attachment) return null;

                    if (attachment.mime_type?.includes("image")) {
                        return (
                            <div className="imageAttachment" key={i}>
                                IMAGE
                                {/* <ImageLoader
                                    filepath={
                                        "users/" +
                                        props.uid +
                                        "/" +
                                        props.projectId +
                                        "/attachments/" +
                                        attachment.transfer_name +
                                        ".webp"
                                    }
                                    uid={props.uid}
                                /> */}
                            </div>
                        );
                    } else {
                        return (
                            <div key={i} className="otherAttachment">
                                <IconFile className="w-5 inline-block" />
                                <p>{attachment.transfer_name}</p>
                            </div>
                        );
                    }
                })}
                <p>{message.text?.replaceAll("\uFFFC", "")}</p>
                <p className="bubbleLabel">
                    {props.displayname ? props.displayname + " " : ""}
                    {timeStr}
                </p>
            </div>
            {/* <svg
                width="10px"
                height="10px"
                viewBox="0 0 200 200"
                transform={message.is_from_me ? "scaleX(1)" : "scaleX(-1)"}
            >
                <path
                    d="M100,0L100,100C103.206,148.358 139.48,180.225 200,200C75.873,202.909 1.814,174.239 0,100L0,0L100,0Z"
                    fill={
                        message.is_from_me
                            ? bubbleColourFromService(message.service)
                            : "#f0f2f7"
                    }
                />
            </svg> */}
        </div>
    );
}
