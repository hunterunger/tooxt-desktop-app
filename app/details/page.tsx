"use client";
import DiskAccessDialog from "@/components/DiskAccessDialog";
import useDatabaseMessages from "@/util/useDatabaseMessages";
import { DatePicker } from "@mantine/dates";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageBubble } from "../../components/GroupItem";
import {
    IconBook2,
    IconChevronLeft,
    IconCloudUpload,
    IconExternalLink,
    IconMessageCircle,
} from "@tabler/icons-react";
import ProgressStepper from "@/components/ProgressStepper";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { invoke } from "@tauri-apps/api/tauri";
import uploadImessages from "@/util/uploadIMessages";
import generateProjectEditorUrl from "@/util/generateProjectEditorUrl";
import Loader from "@/shared/Loader";
import ChatHistoryHtml from "@/components/mockPdf/MockChatHistoryPdf";
import React from "react";
import { ChatroomType } from "@/ts/messageTypes";
import pagesToBooks from "@/components/pagesToBooks";
import pluralize from "@/util/pluralize";

export default function Page() {
    const [user, loading] = useAuthState(getAuth());

    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [projectUrl, setProjectUrl] = useState<string>("");

    const [estimatedPages, setEstimatedPages] = useState<number>();

    const searchParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams();

    const chatId = searchParams.get("id");

    const [databasePath, setDatabasePath] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([
        moment().subtract(1, "week").toDate(),
        moment().add(1, "day").toDate(),
    ]);
    const [didChangeDateFilter, setDidChangeDateFilter] =
        useState<boolean>(false);

    const {
        loadingMessages,
        contacts,
        chatrooms,
        permissionSuccess,
        setPermissionSuccess,
    } = useDatabaseMessages(
        databasePath,
        dateFilter,
        chatId ? parseInt(chatId) : undefined,
        undefined
    );

    useEffect(() => {
        if (!chatrooms) return;
        // reset the estimated pages when the date filter changes
        if (estimatedPages !== undefined) setEstimatedPages(undefined);
    }, [chatrooms?.[chatId + ""].messages.length, dateFilter]);

    if (chatId === null || typeof chatId !== "string") {
        return <div>Invalid chat id</div>;
    }

    const thisChatroom = chatrooms?.[chatId];

    return (
        <div className="flex flex-col gap-3 h-screen overflow-hidden">
            <div className=" absolute opacity-0">
                {thisChatroom !== undefined && estimatedPages === undefined && (
                    <ChatHistoryHtml
                        project={{
                            id: "",
                            title: "New Project",
                            description: "A conversation  ",
                            projectName: "New Project",
                            subtitle: "A conversation",

                            created: Date.now(),
                            updated: Date.now(),
                            contactAliases: {},

                            platform: "imessage",

                            attachmentSavePaths: [],
                            uncompressedChatroom: thisChatroom,
                        }}
                        setEstimatedPages={setEstimatedPages}
                    />
                )}
            </div>
            <div className="w-full p-3 pt-8 bg-white dark:bg-zinc-800 z-20 flex flex-col gap-3">
                <DiskAccessDialog setPermissionSuccess={setPermissionSuccess} />
                <div className="flex font-bold items-center">
                    <Link href="/">
                        <IconChevronLeft className="dark:text-white" />
                    </Link>
                </div>
                <ProgressStepper
                    step={!projectUrl ? (!isUploading ? 1 : 2) : 3}
                />
                {!isUploading && (
                    <div className="flex justify-between gap-1 items-center">
                        <h3 className=" text-sm dark:text-white text-black text-opacity-50 flex gap-1 items-center self-end">
                            <IconMessageCircle size={16} />
                            {thisChatroom
                                ? thisChatroom.messages.length + " messages"
                                : "0 messages"}

                            <IconBook2 size={16} />
                            {thisChatroom && estimatedPages !== undefined
                                ? "~" + pagesToBooks(estimatedPages) +
                                " " +
                                pluralize(
                                    "book",
                                    pagesToBooks(estimatedPages)
                                )
                                : " 0 books"}
                        </h3>
                        <button
                            className={
                                " text-white rounded-xl shadow-md flex gap-1 items-center justify-between bg-primary-1 font-medium p-2 px-6 text-sm h-min " +
                                (user ? "" : "opacity-40") +
                                (didChangeDateFilter ? "" : "opacity-40")
                            }
                            disabled={!didChangeDateFilter}
                            onClick={() => {
                                if (!user || !thisChatroom) return;
                                setIsUploading(true);
                                uploadImessages(thisChatroom, user, true).then(
                                    (project) => {
                                        setProjectUrl(
                                            generateProjectEditorUrl(project.id)
                                        );
                                        // setIsUploading(false);
                                    }
                                );
                            }}
                        >
                            {!didChangeDateFilter
                                ? "Select a Timeframe to Upload"
                                : "Upload"}
                            <IconCloudUpload size={16} />
                        </button>
                    </div>
                )}
            </div>
            {!isUploading ? (
                <div className=" flex flex-row p-3 gap-3 overflow-auto">
                    <div
                        onClick={() => {
                            setDidChangeDateFilter(true);
                        }}
                        className="w-fit p-3 bg-white rounded-xl h-fit border dark:border-slate-800 border-gray-200"
                    >
                        <DateRangeSelector
                            setDateFilter={setDateFilter}
                            dateFilter={dateFilter}
                            databasePath={databasePath}
                            chatId={parseInt(chatId)}
                        />
                    </div>
                        <div className=" rounded-md overflow-scroll flex flex-col gap-3">
                            {thisChatroom !== undefined &&
                                thisChatroom.messages.map((message) => (
                                    <MessageBubble
                                        message={message}
                                        key={message.rowid}
                                    />
                                ))}
                            {loadingMessages && (
                                <div className="flex w-full h-full items-center text-center text-lg justify-center my-12 dark:text-white text-black">
                                    <Loader />
                                </div>
                            )}
                            {thisChatroom === undefined && !loadingMessages && (
                                <div className="flex w-full h-full items-center text-center text-lg justify-center my-12 dark:text-white text-black">
                                    No messages for this timeframe
                                </div>
                            )}
                    </div>
                </div>
            ) : (
                <div className="flex w-full h-full items-center text-center text-lg justify-center my-12 dark:text-white text-black">
                    {!projectUrl ? (
                        <div className="flex items-center gap-1">
                            <Loader />
                            Uploading...
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 items-center font-semibold">
                            <p>Your project has uploaded</p>
                            <a
                                href={projectUrl}
                                target="_blank"
                                className=" bg-primary-1 text-white rounded-2xl shadow-md p-2 px-6 flex gap-2 items-center font-medium text-lg"
                            >
                                {"Open Project"}
                                <IconExternalLink size={16} />
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function DateRangeSelector(props: {
    setDateFilter: (date: [Date | null, Date | null]) => void;
    dateFilter: [Date | null, Date | null];

    databasePath: string;
    chatId: number;
}) {
    return (
        <div className=" h-fit">
            <div className=" flex flex-col gap-1 justify-start flex-wrap">
                <div className=" mb-3 ">
                    <h3 className=" flex flex-row items-center gap-1 font-medium">
                        Select Date Range
                    </h3>
                </div>

                {[
                    { label: "Last 6 Months", value: 180 },
                    { label: "Last 365 Days", value: 365 },
                ].map((item) => (
                    <button
                        className="hover:bg-black duration-100 hover:bg-opacity-10 bg-opacity-20 w-full bg-primary-dark-2 rounded-xl px-3"
                        key={item.label}
                        onClick={() => {
                            props.setDateFilter([
                                moment().subtract(item.value, "day").toDate(),
                                moment().add(1, "day").toDate(),
                            ]);
                        }}
                    >
                        {item.label}
                    </button>
                ))}
                {[
                    { label: "First 6 Months", value: 6 },
                    { label: "First Year", value: 12 },
                    { label: "All Time", value: null },
                ].map((item) => (
                    <button
                        key={item.label}
                        className="hover:bg-black duration-100 hover:bg-opacity-10 bg-opacity-20 w-full bg-primary-dark-2 rounded-xl px-3"
                        onClick={() => {
                            if (item.value === null) {
                                props.setDateFilter([
                                    moment().subtract(20, "year").toDate(),
                                    moment().add(1, "day").toDate(),
                                ]);
                                return;
                            }

                            invoke<string>("get_messages", {
                                custompath: props.databasePath,
                                fromdate: "2007-01-01",
                                todate: "2037-01-01",
                                chatidfilter: props.chatId,
                                maxmessagespergroup: undefined,
                            }).then((data) => {
                                const newChatrooms: {
                                    [key: string]: ChatroomType;
                                } = JSON.parse(data);

                                // get the first occuring date
                                const firstChatroom =
                                    newChatrooms[Object.keys(newChatrooms)[0]];

                                const firstDateOcurred = new Date(
                                    firstChatroom.messages[0].date_str
                                );

                                // set the dates
                                props.setDateFilter([
                                    firstDateOcurred,
                                    moment(firstDateOcurred)
                                        .add(item.value, "months")
                                        .toDate(),
                                ]);
                            });
                        }}
                    >
                        {item.label}
                    </button>
                ))}
                <div
                    className="duration-100 bg-opacity-10 w-full bg-primary-dark-2 rounded-xl px-3 mt-3"
                >
                    <DatePicker
                        type="range"
                        weekendDays={[0, 6]}
                        firstDayOfWeek={0}
                        allowSingleDateInRange
                        placeholder="Pick dates range"
                        value={props.dateFilter}
                        onChange={props.setDateFilter}
                    />
                </div>
            </div>
        </div>
    );
}
