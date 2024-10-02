import { ChatroomType } from "@/ts/messageTypes";
import { notifications } from "@mantine/notifications";
import { BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import JSZip from "jszip";

export async function zipChatroomData(chatroom: ChatroomType) {
    const jsonString = JSON.stringify(chatroom);

    const zip = new JSZip();

    zip.file("messages-" + chatroom.chat_identifier + ".json", jsonString);

    // go through each message and add attachments
    const saveImages = true;

    const totalAttachments = chatroom.messages.reduce((acc, message) => {
        return (
            acc +
            message.attachments.filter((attachment) =>
                attachment.mime_type?.includes("image")
            ).length
        );
    }, 0);

    let attachmentsRemaining = totalAttachments;

    const progressNotificationId = notifications.show({
        loading: true,
        title: "Exporting Message",
        message: "Exporting " + chatroom.chat_identifier + "...",
        autoClose: false,
        withCloseButton: false,
    });

    const attachmentErrors: string[] = [];

    if (totalAttachments > 0) {
        zip.folder("attachments");

        for (const message of chatroom.messages) {
            for (const attachment of message.attachments) {
                if (!attachment.mime_type?.includes("image") || !saveImages)
                    continue;

                if (attachment.filepath) {
                    const imgSrc = `${attachment.filepath
                        .replace("~", "")
                        .replace("/", "")}`;

                    try {
                        const contents = await readBinaryFile(imgSrc, {
                            dir: BaseDirectory.Home,
                        });
                        const buffer = Buffer.from(contents);
                        const blob = new Blob([buffer]);
                        zip.file(
                            "attachments/" + attachment.transfer_name,
                            blob
                        );
                    } catch (e) {
                        console.error(e);
                        attachmentErrors.push(attachment.transfer_name);
                    }
                    attachmentsRemaining--;
                    notifications.update({
                        id: progressNotificationId,
                        message: `Exporting ${chatroom.chat_identifier}... ${attachmentsRemaining} attachments remaining.`,
                    });
                }
            }
        }
    }

    const content = await zip.generateAsync({
        type: "blob",
    });

    notifications.update({
        id: progressNotificationId,
        message: `Exporting ${chatroom.chat_identifier}... Zipping file...`,
        autoClose: 3000,
    });

    if (attachmentErrors.length > 0) {
        notifications.show({
            title: "Error exporting attachments",
            message: `There was an error exporting ${attachmentErrors.length} attachments. This is likely because the related message are not synced to this device.`,
            autoClose: false,
            withCloseButton: true,
        });
    }

    return { content, attachmentErrors };
}
