const isDevEndpoints = process.env.DEV_ENDPOINTS === "true";

export default {
    convertImage: isDevEndpoints
        ? "http://127.0.0.1:5001/message-story-firebase/us-central1/convertImage"
        : "https://us-central1-message-story-firebase.cloudfunctions.net/convertImage",

    uploadImage: isDevEndpoints
        ? "http://127.0.0.1:5001/message-story-firebase/us-central1/uploadImage"
        : "https://us-central1-message-story-firebase.cloudfunctions.net/uploadImage",
    uploadImage1bgMem: isDevEndpoints
        ? "http://127.0.0.1:5001/message-story-firebase/us-central1/uploadImage1gbMem"
        : "https://us-central1-message-story-firebase.cloudfunctions.net/uploadImage1gbMem",
    rmProject: "/api/rm-project",
};
