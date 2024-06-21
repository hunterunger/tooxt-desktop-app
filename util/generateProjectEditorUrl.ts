import { webAppUrl } from "./webAppUrl";

export default function generateProjectEditorUrl(projectId: string) {
    return `${webAppUrl}/chats/editor/${projectId}`;
}
