export type ServiceOptions =
    | "SMS"
    | "iMessage"
    | "instagram"
    | "facebook"
    | "whatsapp";

export type MessageType = {
    chat_identifier: string;
    associated_message_guid: null;
    associated_message_type: number;
    balloon_bundle_id: null;
    chat_id: number | null;
    date: number;
    from_address: string;
    date_str: string;
    date_delivered: number;
    date_edited: number;
    date_read: number;
    deleted_from: null;
    expressive_send_style_id: null;
    group_action_type: number;
    group_title: string | null;
    guid: string;
    handle_id: number;
    is_from_me: boolean;
    is_read: boolean;
    item_type: number;
    num_attachments: number;
    num_replies: number;
    rowid: number;
    service: ServiceOptions;
    subject: null;
    text?: string;
    thread_originator_guid: null;
    thread_originator_part: null;
    attachments: Attachment[];
};

export type ChatroomType = {
    chat_id: number;
    chat_identifier: string;
    display_name?: string;
    participants?: string[];
    rowid: number;
    service_name: ServiceOptions;
    messages: MessageType[];
    contact_book_name: string | null;
};

interface Attachment {
    filepath: string;
    filename: string;
    transfer_name: string;
    hide_attachment: boolean;
    mime_type: string | null;
    uti: string;
    total_bytes: number;
    is_sticker: boolean;
}

export type UserDataType = {
    username?: string;
    name?: {
        first: string;
        last: string;
    };
    lastLogin?: number;
    lastLoginIP?: string;
    secure?: {
        plan: string;
    };
    projects?: Record<string, ProjectType>;
};

export type ProjectType = {
    platform:
        | "imessage"
        | "whatsapp"
        | "facebook"
        | "instagram"
        | "twitter"
        | "snapchat"
        | "discord"
        | "slack"
        | "telegram"
        | "signal"
        | "other";
    id: string;
    title: string;
    description: string;

    created: number;
    updated: number;
    secure?: {
        plan: string;
    };

    attachmentSavePaths?: string[];
    chatroom?: ChatroomType;
    compressedChatroom?: string;

    contactAliases?: Record<string, string>;
    featureImageFilename?: string;
};
