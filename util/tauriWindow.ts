export default async function tauriWindow() {
    if (typeof window !== "undefined") {
        try {
            const appWindow = (await import("@tauri-apps/api/window")).appWindow;
            return appWindow;
        } catch (error) {
            console.log(error);
        }
    }
}
