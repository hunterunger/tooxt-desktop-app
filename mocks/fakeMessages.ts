import { ChatroomType, MessageType } from "@/ts/messageTypes";

const fakeMessageBase: MessageType = {
    associated_message_guid: null,
    associated_message_type: 0,
    balloon_bundle_id: null,
    chat_id: 0,
    date_str: "2023-06-13 12:12:12",
    date_delivered: 0,
    date_edited: 0,
    date_read: 708325325148700000,
    deleted_from: null,
    expressive_send_style_id: null,
    group_action_type: 0,
    group_title: null,
    guid: "ABCDEF-123456-ABCDEF-123456",
    handle_id: 1,
    is_from_me: false,
    is_read: true,
    item_type: 0,
    num_attachments: 0,
    num_replies: 0,
    rowid: 0,
    service: "iMessage",
    subject: null,
    text: "Who’s free Friday for a hike?",
    thread_originator_guid: null,
    thread_originator_part: null,
    chat_identifier: "Fake Group Chat",
    date: 0,
    attachments: [],
    from_address: "test@example.com",
};

const fakeMessageGroupBase: ChatroomType = {
    messages: [],
    chat_id: 0,
    chat_identifier: "chat1",
    display_name: "Hiking Group Chat",
    rowid: 0,
    service_name: "SMS",
    contact_book_name: null,
};

const fakeConversation: {
    is_from_me: boolean;
    text: string;
}[] = [
    {
        is_from_me: false,
        text: "Who’s free Friday for a hike?",
    },
    {
        is_from_me: true,
        text: "I’m free! 👍",
    },
    {
        is_from_me: false,
        text: "I’m free too!",
    },
    {
        is_from_me: true,
        text: "Awesome! Does 10am work for everyone?",
    },
    {
        is_from_me: false,
        text: "Sounds good to me!",
    },
    {
        is_from_me: true,
        text: "I’ll bring the snacks.",
    },
    {
        is_from_me: false,
        text: "Hopefully it doesn’t rain. The forecast says it might... :(",
    },
    {
        is_from_me: true,
        text: "I’ll bring a raincoat just in case.",
    },
];

export function generateFakeChatroom() {
    // compile fake message group
    const fakeMessages = [];

    for (let i = 0; i < fakeConversation.length; i++) {
        const fakeMessage = {
            ...fakeMessageBase,
            ...fakeConversation[i],
        };
        fakeMessages.push(fakeMessage);
    }

    const fakeMessageGroup: ChatroomType = {
        ...fakeMessageGroupBase,
        messages: fakeMessages,
    };

    return fakeMessageGroup;
}
