"use client";
import { BaseDirectory, readBinaryFile } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";
import {
    IconChevronDown,
    IconChevronRight,
    IconFile,
    IconPhoto,
} from "@tabler/icons-react";
import { User } from "firebase/auth";
import Image from "next/image";
import { ContactCard } from "@/util/addressBookTools";
import Link from "next/link";
import { ChatroomType, MessageType } from "@/ts/messageTypes";
import Loader from "@/shared/Loader";

export function GroupItem(props: {
    chatroom: ChatroomType;
    user: User | null | undefined;
    onLoadRelativeDelta: (e: any) => void;
    curentPin?: string | number;
    onPin?: () => void;
    contacts: ContactCard[];
}) {
    // get 5 latest messages
    const { chatroom, user, onLoadRelativeDelta } = props;
    const [showChat, setShowChat] = useState<boolean>(false);
    const [thisProjectUrl, setThisProjectUrl] = useState<string>();

    const filteredMessages = chatroom.messages.filter((v) => v.text != null);

    const displayName =
        chatroom.display_name ||
        chatroom.contact_book_name ||
        chatroom.chat_identifier;

    useEffect(() => {
        // reset project url when chatroom changes
        setThisProjectUrl(undefined);
    }, [props.chatroom]);

    return (
        <div
            className="bg-white shadow overflow-hidden rounded-lg w-full relative border border-gray-200 "
            key={props.chatroom.rowid}
        >
            <div className="px-4 py-5 sm:px-6 flex flex-row justify-between sticky top-0 flex-wrap gap-3 items-center">
                <div className="text-lg leading-6 font-medium text-gray-900">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className=" text-black text-opacity-40 hover:text-opacity-100 duration-100"
                        >
                            <IconChevronDown
                                size={20}
                                className={
                                    " transform transition-transform duration-500 " +
                                    (showChat ? "rotate-0" : "-rotate-90")
                                }
                            />
                        </button>

                        <h2 className=" text-gray-800 font-bold select-text">
                            {displayName}
                        </h2>
                    </div>
                    {!!props.chatroom.participants &&
                        props.chatroom.participants.length > 1 && (
                            <h3>
                                {props.chatroom.participants.map(
                                    (participant) => (
                                        <p
                                            key={participant}
                                            className=" text-gray-500 font-normal select-text text-xs"
                                        >
                                            {participant.split(" ")[0]}
                                        </p>
                                    )
                                )}
                            </h3>
                        )}
                </div>
                <div className="flex gap-3">
                    <Link
                        className={
                            " text-white rounded-md flex gap-1 items-center bg-primary-1 p-2 px-2 text-sm h-min font-semibold " +
                            (user ? "" : "opacity-40")
                        }
                        href={"/details?id=" + chatroom.chat_id}
                    >
                        {"Select"}
                        <IconChevronRight size={16} />
                    </Link>
                </div>
            </div>

            <div
                className={
                    "border-t border-gray-200 transform transition-transform duration-500 "
                }
                style={{
                    maxHeight: showChat ? "10000px" : "0px",
                    transition: "max-height 0.5s ease-in-out",
                }}
            >
                <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                            Chat Preview
                        </dt>
                        <dd className="mt-1 sm:mt-0 sm:col-span-2">
                            <div className=" gap-1 flex flex-col">
                                {filteredMessages
                                    .slice(
                                        0,
                                        props.chatroom.messages.length > 6
                                            ? 3
                                            : 6
                                    )
                                    .map((message) => (
                                        <MessageBubble
                                            message={message}
                                            key={message.rowid}
                                        />
                                    ))}
                                {props.chatroom.messages.length > 6 && (
                                    <div className="w-full text-center text-black text-opacity-50 my-4 py-3 border-y">
                                        {"... " +
                                            (filteredMessages.length - 6) +
                                            " more ..."}
                                    </div>
                                )}
                                {props.chatroom.messages.length > 6 &&
                                    filteredMessages
                                        .slice(
                                            filteredMessages.length - 3,
                                            filteredMessages.length
                                        )
                                        .map((message) => (
                                            <MessageBubble
                                                message={message}
                                                key={message.rowid}
                                            />
                                        ))}
                            </div>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

export function MessageBubble(props: { message: MessageType }) {
    const { message } = props;

    const bubbleColour =
        message.service == "iMessage"
            ? "linear-gradient(0deg, #30a0fd 0%, #46b3fb 100%)"
            : "linear-gradient(0deg, #62c954 0%, #68d25e 100%)";

    const containsImage = message.attachments.some((attachment) =>
        attachment.mime_type?.includes("image")
    );

    const bubbleTextColour = message.is_from_me ? "white" : "black";

    return (
        <div
            className={
                "text-sm p-3 select-text max-w-full " +
                (containsImage ? "w-2/3" : "w-fit")
            }
            style={{
                // gradient
                background: message.is_from_me
                    ? bubbleColour
                    : "linear-gradient(0deg, #e9e9eb 0%, #e9e9eb 100%)",
                color: bubbleTextColour,

                textAlign: message.is_from_me ? "right" : "left",
                alignSelf: message.is_from_me ? "flex-end" : "flex-start",
                borderRadius: message.is_from_me
                    ? "20px 20px 0 20px"
                    : "20px 20px 20px 0",
            }}
        >
            <div className=" flex flex-col gap-2 w-full">
                {message.attachments.map((attachment, i) => {
                    if (attachment.hide_attachment) return null;

                    if (attachment.mime_type?.includes("image")) {
                        return (
                            <ImageLoader
                                filepath={attachment.filepath}
                                key={i}
                            />
                        );
                    } else {
                        return (
                            <div
                                key={i}
                                className="flex flex-row gap-2 mb-3 items-center"
                            >
                                <IconFile size={16} />
                                <code className=" whitespace-pre-wrap opacity-50">
                                    {attachment.transfer_name}
                                </code>
                            </div>
                        );
                    }
                })}
            </div>
            <p className=" whitespace-pre-line break-words">{message.text}</p>
            <p
                className=" text-xs "
                style={{
                    color: bubbleTextColour,
                    opacity: 0.5,
                }}
            >
                {message.from_address + ", " + message.date_str}
            </p>
        </div>
    );
}

function ImageLoader(props: { filepath: string }) {
    const [image, setImage] = useState<any | null>(null);
    const [error, setError] = useState<any | null>(null);
    useEffect(() => {
        if (props.filepath) {
            const imgSrc = `${props.filepath
                .replace("~", "")
                .replace("/", "")}`;
            readBinaryFile(imgSrc, { dir: BaseDirectory.Home }).then(
                async (contents) => {
                    const buffer = Buffer.from(contents);
                    const blob = new Blob([buffer]);
                    if (!props.filepath.endsWith(".heic")) {
                        const url = URL.createObjectURL(blob);
                        setImage(url);
                    } else {
                        setError(
                            "HEIC images not viewable in-app. Upload to view."
                        );
                    }
                }
            );
        }
    }, [props.filepath]);

    if (error) {
        return (
            <div className="bg-red-100 text-red-500 p-3 rounded-md flex flex-row gap-1 items-center text-xs">
                <IconPhoto size={16} />
                {error}
            </div>
        );
    }

    if (image) {
        return (
            <div className=" relative w-full aspect-square rounded-md overflow-hidden">
                <Image className=" object-contain" alt="" src={image} fill />
            </div>
        );
    }

    return (
        <div>
            <Loader />
        </div>
    );
}
