"use client";

import DiskAccessDialog from "@/components/DiskAccessDialog";
import LoginOverlay from "@/components/LoginOverlay";
import Loader from "@/shared/Loader";
import { ChatroomType } from "@/util/dataTypes";
import { firebaseAuth } from "@/util/firebase/firebaseFrontend";
import trimTextPretty from "@/util/trimTextPretty";
import { NativeSelect, Space, TextInput } from "@mantine/core";
import {
    IconFolder,
    IconHistory,
    IconLogin,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { GroupItem } from "../components/GroupItem";
import useDatabaseMessages from "@/util/useDatabaseMessages";
import ProgressStepper from "@/components/ProgressStepper";

export default function Home() {
    const [user, loading] = useAuthState(firebaseAuth);

    const [sortBy, setSortBy] = useState<"Date" | "Name" | "Most">("Date");
    const [search, setSearch] = useState<string>("");

    const [databasePath, setDatabasePath] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([
        // if its a development env, use the last 5 years
        process.env.NODE_ENV === "development"
            ? moment().subtract(1, "week").toDate()
            : moment().subtract(5, "year").toDate(),
        moment().add(1, "day").toDate(),
    ]);

    const [chatIdPin, setChatIdPin] = useState<number>();

    const maxMessagesPerGroup = 2; // use undefined to get all available messages

    const {
        loadingMessages,
        contacts,
        chatrooms,
        permissionSuccess,
        setPermissionSuccess,
    } = useDatabaseMessages(
        databasePath,
        dateFilter,
        chatIdPin,
        maxMessagesPerGroup
    );

    // memoize the filtered chatrooms
    const filteredChatrooms = useMemo<ChatroomType[]>(() => {
        if (!chatrooms) return [];

        const filteredValues =
            search || chatIdPin
                ? Object.values(chatrooms).filter((chatroom) => {
                      if (chatIdPin) {
                          if (chatroom.chat_id === chatIdPin) return true;
                          return false;
                      }
                      // search by name
                      if (search) {
                          const searchLower = search.toLowerCase();
                          if (
                              chatroom.display_name
                                  ?.toLowerCase()
                                  .includes(searchLower) ||
                              chatroom.contact_book_name
                                  ?.toLowerCase()
                                  .includes(searchLower) ||
                              chatroom.chat_identifier
                                  ?.toLowerCase()
                                  .includes(searchLower)
                          ) {
                              return true;
                          }
                      }
                      return false;
                  })
                : Object.values(chatrooms);

        const sortedValues = filteredValues.sort((a, b) => {
            if (sortBy === "Date") {
                return (
                    new Date(
                        b.messages[b.messages.length - 1].date_str
                    ).getTime() -
                        new Date(
                            a.messages[a.messages.length - 1].date_str
                        ).getTime() || 0
                );
            } else if (sortBy === "Name") {
                return (
                    a.display_name?.localeCompare(
                        b.display_name || b.chat_identifier
                    ) || 0
                );
            } else if (sortBy === "Most") {
                return b.messages.length - a.messages.length || 0;
            } else {
                return 0;
            }
        });

        // return as object
        return sortedValues;
    }, [chatrooms, search, sortBy, chatIdPin]);

    // login panel
    const [openLoginPanel, setOpenLoginPanel] = useState<boolean>(false);
    useEffect(() => {
        if (user) {
            setOpenLoginPanel(false);
        } else {
            setOpenLoginPanel(true);
        }
    }, [user]);

    return (
        <>
            {openLoginPanel && (
                <LoginOverlay onClose={() => setOpenLoginPanel(false)} />
            )}
            <main className="flex min-h-screen flex-col gap-3">
                <DiskAccessDialog setPermissionSuccess={setPermissionSuccess} />

                <div className="flex flex-col gap-3 fixed  bg-white dark:bg-zinc-800  w-full z-10 p-3">
                    <div className="flex gap-2 justify-between ">
                        {/* <DateRangeSelector dateFilter={dateFilter} setDateFilter={setDateFilter} /> */}
                        <img src="/logo.png?" className="w-24 h-full" />
                        {loading ? (
                            <></>
                        ) : user ? (
                            <button
                                onClick={() => {
                                    const auth = firebaseAuth;
                                    auth.signOut();
                                }}
                                className=" flex gap-1 text-end flex-row font-medium dark:text-white text-black text-opacity-40 rounded-md w-fit items-center text-xs"
                            >
                                Logout <br /> {user.email}
                            </button>
                        ) : (
                            <button
                                onClick={() => setOpenLoginPanel(true)}
                                className=" flex gap-1 flex-row font-medium bg-msg-blue text-white rounded-md w-fit items-center text-sm"
                            >
                                <IconLogin size={16} />
                                Login
                            </button>
                        )}
                    </div>
                    <ProgressStepper step={0} />
                    <div className=" row gap-3 hidden">
                        <ThemedButton
                            onClick={() => {
                                open({
                                    filters: [
                                        {
                                            name: "Database",
                                            extensions: ["db"],
                                        },
                                    ],
                                }).then((result) => {
                                    if (result === undefined) return;
                                    // result is either an array, string, or undefined
                                    if (Array.isArray(result)) {
                                        setDatabasePath(result[0]);
                                    } else if (typeof result === "string") {
                                        setDatabasePath(result);
                                    }
                                });
                            }}
                        >
                            <IconFolder size={16} />
                            Custom
                        </ThemedButton>
                        <div>
                            {databasePath === "" ? (
                                <></>
                            ) : (
                                <div className="text-sm text-gray-400">
                                    {trimTextPretty(databasePath, 30, true)}
                                    <IconX
                                        onClick={() => {
                                            setDatabasePath("");
                                        }}
                                        size={16}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-row gap-1 w-full">
                        <TextInput
                            className="w-full"
                            leftSection={<IconSearch size={16} />}
                            placeholder="Search by contact or group name"
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            // x to clear
                            rightSection={
                                search && (
                                    <IconX
                                        onClick={() => {
                                            setSearch("");
                                        }}
                                        size={16}
                                        className="cursor-pointer"
                                    />
                                )
                            }
                        />
                        <NativeSelect
                            data={[
                                { label: "Sort by Date", value: "Date" },
                                { label: "Sort Alphabetically", value: "Name" },
                                // { label: "Sort by Most Messages", value: "Most" },
                            ]}
                            className="w-1/3"
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(e.currentTarget.value as any)
                            }
                        />
                    </div>
                </div>
                <div className="m-20" />
                {chatrooms != undefined &&
                    Object.keys(filteredChatrooms).length === 0 && (
                        <div className="text-black text-opacity-50 text-center h-full w-full mt-12 justify-center items-center">
                            No messages found with these filters.
                        </div>
                    )}
                {chatrooms === undefined ? (
                    <div className=" dark:text-white text-black flex flex-row text-opacity-50 gap-2 text-center h-full w-full mt-12 justify-center items-center">
                        <Loader />
                        Retrieving conversations...
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 w-full relative p-3">
                        {filteredChatrooms.map((chatroom) => (
                            <GroupItem
                                contacts={contacts || []}
                                chatroom={chatroom}
                                key={chatroom.rowid}
                                onPin={() => {
                                    if (chatIdPin === chatroom.chat_id) {
                                        setChatIdPin(undefined);
                                        return;
                                    }
                                    setChatIdPin(chatroom.chat_id);
                                }}
                                curentPin={chatIdPin}
                                user={user}
                                onLoadRelativeDelta={(monthsFromFirst) => {
                                    if (loadingMessages) return;
                                    // setLoadingMessages(true);
                                    invoke<string>("get_messages", {
                                        custompath: databasePath,
                                        fromdate: "2007-01-01",
                                        todate: "2037-01-01",
                                        chatidfilter: chatroom.chat_id,
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

                                        setSearch(
                                            firstChatroom.display_name ||
                                                firstChatroom.chat_identifier
                                        );

                                        setChatIdPin(firstChatroom.chat_id);

                                        // set the dates
                                        setDateFilter([
                                            firstDateOcurred,
                                            moment(firstDateOcurred)
                                                .add(monthsFromFirst, "months")
                                                .toDate(),
                                        ]);
                                    });
                                }}
                            />
                        ))}
                        {dateFilter[0]?.getFullYear() !== 2008 && (
                            <div className="w-full text-center flex gap-3 flex-col justify-center text-black dark:text-white">
                                <button
                                    onClick={() => {
                                        // change the time range to Jan 1, 2008

                                        setDateFilter([
                                            moment("Jan 1, 2008").toDate(),
                                            moment().add(1, "day").toDate(),
                                        ]);
                                    }}
                                    className=" bg-primary-1 text-white rounded-md px-2 py-1 font-medium w-fit self-center flex items-center gap-2"
                                >
                                    <IconHistory size={16} />
                                    Load more history
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}

function ThemedButton(props: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            disabled={props.disabled}
            className=" flex gap-1 flex-row font-medium px-2 py-1 bg-opacity-10 dark:bg-white dark:bg-opacity-20 bg-black rounded-md w-fit items-center "
            {...props}
            style={{
                opacity: props.disabled ? 0.5 : 1,
            }}
        />
    );
}
