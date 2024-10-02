import { ChatroomType } from "./messageTypes";

export type UserDataType = {
    username?: string;
    firstName?: string;
    lastName?: string;

    lastLogin?: number;
    lastLoginIP?: string;
    secure?: {
        plan: string;
    };
    projects?: Record<string, ProjectType>;
    tutorialStatus?: {
        tutorialSlug: string;
        currentStep: number;
    }[];
};

export type PlatformType =
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

export type ProjectType = {
    platform: PlatformType;
    id: string;
    projectName: string;

    title: string;
    subtitle: string;
    description: string;

    created: number;
    updated: number;
    secure?: {
        plan: string;
    };

    attachmentSavePaths?: string[];
    uncompressedChatroom?: ChatroomType;
    compressedChatroom?: string;

    contactAliases?: Record<string, string>;
    featureImageFilename?: string;

    estimatedPages?: number;
};

export type InstagramChatroomType = {
    participants: {
        name: string;
    }[];
    title: string;
    is_still_participant: boolean;
    thread_path: string;
    magic_words: string;
    messages: InstagramMessageType[];
};

export type InstagramMessageType = {
    sender_name: string;
    timestamp_ms: number;
    content: string;
    is_geoblocked_for_viewer: boolean;
    reactions?: {
        reaction: string;
        actor: string;
    }[];
    photos?: {
        uri: string;
    }[];
};
