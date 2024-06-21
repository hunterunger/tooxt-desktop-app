import { logEvent } from "firebase/analytics";
import { firebaseAnalytics } from "./firebase/firebaseFrontend";
import appconfig from "@/src-tauri/tauri.conf.json";

export function logMessage(message: string, details?: string) {
    console.log(message);

    logEvent(firebaseAnalytics, "appLogging", {
        message,
        details,
        app_verison: appconfig.package.version,
    });
}

export function logError(message: string, details?: string) {
    console.error(message);

    logEvent(firebaseAnalytics, "appError", {
        message,
        details,
        app_verison: appconfig.package.version,
    });
}
