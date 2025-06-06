import { User } from "firebase/auth";
import { notifications } from "@mantine/notifications";
import { BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import { setUserData, uploadProjectPhoto } from "./firebase/userData";
import { generateUid } from "./generateUid";
import pako from "pako";
import { logError } from "./logging";
import { loadAllContacts } from "./loadAllContacts";
import { findNameFromAddress } from "./findNameFromAddress";
import { joinWithLastWord } from "./joinWithLastWord";
import { ChatroomType } from "@/ts/messageTypes";
import { ProjectType } from "@/ts/dataTypes";
import { logEvent } from "firebase/analytics";
import { firebaseAnalytics } from "./firebase/firebaseFrontend";
import pluralize from "./pluralize";

export default async function uploadImessages(
    chatroom: ChatroomType,
    user: User,
    saveImages?: boolean
) {
    const newProjectId = generateUid(11);

    // get attachment folder
    const totalAttachments = chatroom.messages.reduce((acc, message) => {
        return (
            acc +
            message.attachments.filter((attachment) =>
                attachment.mime_type?.includes("image")
            ).length
        );
    }, 0);

    let attachmentsRemaining = totalAttachments;
    const attachmentErrors: string[] = [];

    const progressNotificationId = notifications.show({
        loading: true,
        title: "Uploading Messages",
        message:
            "Exporting " +
            (chatroom.contact_book_name ||
                chatroom.display_name ||
                chatroom.chat_identifier) +
            "...",
        autoClose: false,
        withCloseButton: false,
    });

    const attachmentSavePaths: string[] = [];

    // for authentication
    var idToken = await user.getIdToken();

    for (const message of chatroom.messages) {
        for (const attachment of message.attachments) {
            if (!attachment.mime_type?.includes("image") || !saveImages)
                continue;

            if (attachment.filepath) {
                const imgSrc = `${attachment.filepath
                    .replace("~", "")
                    .replace("/", "")}`;

                try {
                    // try to read the file
                    const contents = await readBinaryFile(imgSrc, {
                        dir: BaseDirectory.Home,
                    });

                    const imgBase64 = Buffer.from(contents).toString("base64");
                    const thisImageFilename = attachment.transfer_name;

                    // try to upload the file
                    const uploadPath = await uploadProjectPhoto(
                        imgBase64,
                        "attachments/" + thisImageFilename,
                        newProjectId,
                        idToken,
                        {
                            width: null,
                            quality: 90,
                        }
                    );

                    attachmentSavePaths.push(uploadPath.savePath);
                } catch (e) {
                    attachmentErrors.push(attachment.transfer_name);
                    logError(
                        "Error uploading attachment",
                        "Error uploading attachment for " + user.uid
                    );
                }

                // update progress
                attachmentsRemaining--;
                notifications.update({
                    id: progressNotificationId,
                    message: `Uploading ${chatroom.chat_identifier}... ${attachmentsRemaining} attachments remaining.`,
                });
            }
        }
    }

    // get contacts
    const allContacts = await loadAllContacts();

    // get the contacts for the participants
    const allParticipantsNames: string[] = [];
    const contactAliases = chatroom.participants?.reduce(
        (acc, participant, i) => {
            const contactName = findNameFromAddress(participant, allContacts);

            if (contactName) {
                allParticipantsNames.push(contactName);
            }

            return {
                ...acc,
                [i]: contactName || "",
            };
        },
        { [-1]: "" }
    );

    // Compress the JSON data using pako and gzip algorithm
    const jsonUint8Array = new TextEncoder().encode(
        JSON.stringify(chatroom, null, 2)
    );
    const compressedMessages = pako.gzip(jsonUint8Array);
    const compressedMessagesBase64 =
        Buffer.from(compressedMessages).toString("base64");

    // get the size of the compressed data
    const compressedSize = new Blob([compressedMessages]).size;
    console.log(
        "Compressed size: " +
            compressedSize +
            " bytes (" +
            Math.round((compressedSize / jsonUint8Array.length) * 100) +
            "%)"
    );

    const participantsTitle = joinWithLastWord(allParticipantsNames, "&");

    const newProject: ProjectType = {
        id: newProjectId,
        title:
            chatroom.display_name ||
            participantsTitle ||
            chatroom.chat_identifier ||
            "New Project",
        description:
            "A conversation with " +
            (chatroom.display_name ||
                joinWithLastWord(allParticipantsNames, "and") ||
                chatroom.chat_identifier ||
                "a friend."),

        created: Date.now(),
        updated: Date.now(),
        contactAliases,

        platform: "imessage",

        attachmentSavePaths,
        compressedChatroom: compressedMessagesBase64,
        projectName: "",
        subtitle: "",
    };
    await setUserData(user?.uid || "", {
        projects: {
            [newProjectId]: newProject,
        },
    });

    notifications.hide(progressNotificationId);

    logEvent(firebaseAnalytics, "user_upload_imessage", {
        projectId: newProjectId,
        uid: user.uid,
        attachments: totalAttachments,
    });

    // notify user of completion
    if (attachmentErrors.length > 0) {
        logEvent(firebaseAnalytics, "upload_imessage_attachments_error", {
            projectId: newProjectId,
            uid: user.uid,
            attachments: attachmentErrors.length,
        });

        notifications.show({
            title: "Unable to Upload Attachment",
            message: `We encountered an issue uploading ${
                attachmentErrors.length
            } ${pluralize(
                "attachment",
                attachmentErrors.length
            )}, likely because the message is not synced to your device. Don't worry—you can still print your book, even without this attachment. To include it, please scroll through the chat in the Messages app and make sure it's synced.`,
            autoClose: false,
            withCloseButton: true,
        });
    }

    return newProject;
}
