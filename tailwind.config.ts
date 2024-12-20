import type { Config } from "tailwindcss";

export const colors = {
    "msg-blue": "#46b3fb",
    "msg-green": "#68d25e",
    "gray-1": "#e5e5e5",
    "primary-1": "#f64e43",
};

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            colors,
        },
    },
    plugins: [],
};

export default config;
