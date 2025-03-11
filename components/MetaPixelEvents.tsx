import { useEffect } from "react";

declare global {
    interface Window {
        fbq: (...args: any[]) => void;
    }
}

const trackAddToCart = () => {
    if (window.fbq) {
        window.fbq("track", "AddToCart");
    }
};

const trackPageView = () => {
    useEffect(() => {
        if (window.fbq) {
            window.fbq("track", "PageView");
        }
    }, []);
};

const trackViewContent = () => {
    useEffect(() => {
        if (window.fbq) {
            window.fbq("track", "ViewContent");
        }
    }, []);
};

const trackCustomEvent = (eventName: string) => {
    if (window.fbq) {
        window.fbq("trackCustom", eventName);
    }
};

export {
    trackAddToCart,
    trackPageView,
    trackViewContent,
    trackCustomEvent,
};
