export const webAppUrl =
    process.env.NODE_ENV === "development"
        ? "localhost:3000"
        : "https://message-story-web.vercel.app/";
