"use client";
import DiskAccessDialog from "@/components/DiskAccessDialog";
import useDatabaseMessages from "@/util/useDatabaseMessages";
import { DatePicker, DatePickerInput } from "@mantine/dates";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import { MessageBubble } from "../../components/GroupItem";
import {
    IconCalendarBolt,
    IconChevronLeft,
    IconChevronRight,
    IconExternalLink,
} from "@tabler/icons-react";
import { Menu } from "@mantine/core";
import ProgressStepper from "@/components/ProgressStepper";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { invoke } from "@tauri-apps/api/tauri";
import { ChatroomType } from "@/util/dataTypes";
import uploadImessages from "@/util/uploadIMessages";
import generateProjectEditorUrl from "@/util/generateProjectEditorUrl";
import Loader from "@/shared/Loader";

export default function Page() {
    const [user, loading] = useAuthState(getAuth());

    const [isUploading, setIsUploading] = useState<boolean>(false);

    const [projectUrl, setProjectUrl] = useState<string>("");

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

    if (chatId === null || typeof chatId !== "string") {
        return <div>Invalid chat id</div>;
    }

    const thisChatroom = chatrooms?.[chatId];

    return (
        <div className="flex flex-col gap-3">
            <div className="fixed w-full p-3 bg-white dark:bg-zinc-800 z-20 flex flex-col gap-3">
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
                    <div className="flex justify-between gap-1">
                        <DateRangeSelector
                            setDateFilter={setDateFilter}
                            dateFilter={dateFilter}
                            databasePath={databasePath}
                            chatId={parseInt(chatId)}
                        />
                        <button
                            className={
                                " text-white rounded-md flex gap-1 items-center bg-primary-1 font-semibold p-2 px-2 text-sm h-min " +
                                (user ? "" : "opacity-40")
                            }
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
                            {"Upload"}
                            <IconChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
            <div className="m-16 " />

            {!isUploading ? (
                <>
                    <div className=" gap-1 flex flex-col border border-gray-200 p-3 rounded-md">
                        {thisChatroom !== undefined &&
                            thisChatroom.messages.map((message) => (
                                <MessageBubble
                                    message={message}
                                    key={message.rowid}
                                />
                            ))}
                        {loadingMessages && (
                            <div className="flex w-full h-full items-center text-center text-lg justify-center my-12">
                                <Loader />
                            </div>
                        )}
                        {thisChatroom === undefined && !loadingMessages && (
                            <div className="flex w-full h-full items-center text-center text-lg justify-center my-12">
                                No messages for this timeframe
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex w-full h-full items-center text-center text-lg justify-center my-12 dark:text-white text-black">
                    {!projectUrl ? (
                        <p className="flex items-center gap-1">
                            <Loader />
                            Uploading...
                        </p>
                    ) : (
                        <div className="flex flex-col gap-3 items-center font-semibold">
                            <p>Project uploaded </p>
                            <a
                                href={projectUrl}
                                target="_blank"
                                className=" bg-primary-1 text-white rounded-md p-2 px-4 flex gap-2 items-center font-medium text-lg"
                            >
                                {"View Project"}
                                <IconExternalLink size={24} />
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
        <div className="dark:text-white text-black flex items-center gap-1 rounded-md border-gray-1 border bg-white px-2 cursor-pointer w-fit ">
            <Menu shadow="md" width={200} trigger="hover">
                <Menu.Target>
                    <button className=" flex gap-1 items-center text-sm text-black">
                        <IconCalendarBolt size={16} className=" " />
                        {moment(props.dateFilter[0]).format("MMM D, YYYY") +
                            " to " +
                            moment(props.dateFilter[1]).format("MMM D, YYYY")}
                    </button>
                </Menu.Target>

                <Menu.Dropdown w={"min"}>
                    {[
                        // { label: "Previous Week", value: 7 },
                        // { label: "Last 30 days", value: 30 },
                        { label: "Last 6 Months", value: 180 },
                        { label: "Last 365 Days", value: 365 },
                    ].map((item) => (
                        <Menu.Item
                            key={item.label}
                            onClick={() => {
                                props.setDateFilter([
                                    moment()
                                        .subtract(item.value, "day")
                                        .toDate(),
                                    moment().add(1, "day").toDate(),
                                ]);
                            }}
                        >
                            {item.label}
                        </Menu.Item>
                    ))}
                    {[
                        { label: "First 6 Months", value: 6 },
                        { label: "First Year", value: 12 },
                        { label: "All Time", value: null },
                    ].map((item) => (
                        <Menu.Item
                            key={item.label}
                            className=" cursor-pointer"
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
                                        newChatrooms[
                                            Object.keys(newChatrooms)[0]
                                        ];

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
                        </Menu.Item>
                    ))}
                    <Menu.Item closeMenuOnClick={false}>
                        <DatePicker
                            variant="unstyled"
                            type="range"
                            allowSingleDateInRange
                            placeholder="Pick dates range"
                            value={props.dateFilter}
                            onChange={props.setDateFilter}
                            className="  bg-opacity-90 rounded font-medium"
                        />
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </div>
    );
}
