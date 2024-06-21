import moment from "moment";
import { useEffect, useState } from "react";
import { ContactCard } from "./addressBookTools";
import { loadAllContacts } from "./loadAllContacts";
import { invoke } from "@tauri-apps/api/tauri";
import { findNameFromAddress } from "./findNameFromAddress";
import { ChatroomType } from "./dataTypes";

export default function useDatabaseMessages(
    databasePath: string,
    dateFilter: [Date | null, Date | null],
    chatPin: number | string | undefined,
    maxMessagesPerGroup: number | undefined
) {
    const [contacts, setContacts] = useState<ContactCard[]>();
    const [permissionSuccess, setPermissionSuccess] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(true);

    const [chatrooms, setChatrooms] = useState<{
        [key: string]: ChatroomType;
    }>();

    useEffect(() => {
        if (!!navigator && permissionSuccess) {
            console.log("Loading contacts");

            loadAllContacts()
                .then((v) => {
                    setContacts(v);
                })
                .catch((e) => {
                    setContacts([]);
                });
        }
    }, [permissionSuccess]);

    useEffect(() => {
        if (
            !permissionSuccess ||
            contacts === undefined ||
            dateFilter[0] === null ||
            dateFilter[1] === null
        ) {
            return;
        }

        invoke<string>("get_messages", {
            custompath: databasePath,
            fromdate: moment(dateFilter[0]).format("YYYY-MM-DD"),
            todate: moment(dateFilter[1]).format("YYYY-MM-DD"),
            chatidfilter: chatPin,
            maxmessagespergroup: maxMessagesPerGroup,
        })
            .then((invokeData) => {
                if (invokeData === "{}") {
                    setChatrooms(undefined);
                    setLoading(false);
                    return;
                }

                const newChatrooms: { [key: string]: ChatroomType } =
                    JSON.parse(invokeData);

                Object.keys(newChatrooms).forEach((key) => {
                    const thisContact = findNameFromAddress(
                        newChatrooms[key].chat_identifier,
                        contacts
                    );

                    newChatrooms[key].contact_book_name = thisContact;
                });

                setChatrooms(newChatrooms);
                setLoading(false);
            })
            .catch((e) => {
                console.error(e);
                setLoading(false);
            });
    }, [databasePath, dateFilter, chatPin, contacts]);

    return {
        loadingMessages: loading,
        contacts,
        chatrooms,
        permissionSuccess,
        setPermissionSuccess,
    };
}
