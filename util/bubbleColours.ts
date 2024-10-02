import { ServiceOptions } from "@/ts/messageTypes";

export function bubbleColourFromService(service: ServiceOptions) {
    switch (service) {
        case "iMessage":
            return "#4c8bf9";
        case "whatsapp":
            return "#67bc5c";
        case "facebook":
            return "#3b5998";
        case "instagram":
            return "#bc2a8d";
        case "SMS":
            return "#68d25e";
        default:
            return "#69b67e";
    }
}
