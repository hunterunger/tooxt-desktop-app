"use client";
import { FirebaseOptions, getApp, initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";
import { getAuth } from "firebase/auth";
import { getAnalytics, Analytics } from "firebase/analytics";

function createFirebaseApp(config: FirebaseOptions) {
    try {
        return getApp();
    } catch {
        const app = initializeApp(config);
        return app;
    }
}

// set up firebase
export const firebaseApp = createFirebaseApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

// set up analytics
let firebaseAnalytics: Analytics;

// check if we are in a browser
if (typeof window !== "undefined") {
    firebaseAnalytics = getAnalytics(firebaseApp);
}
export { firebaseAnalytics };
