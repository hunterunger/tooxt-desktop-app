"use client";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import { Inter } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { theme } from "@/theme";
import { Notifications } from "@mantine/notifications";
import { useEffect, useLayoutEffect } from "react";
import MetaPixelScript from "@/components/MetaPixelScript";
import { trackCustomEvent } from "@/components/MetaPixelEvents";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        // check if development environment
        if (process.env.NODE_ENV === "production") {
            document.addEventListener("contextmenu", function (event) {
                event.preventDefault();
            });
        }
    }, []);

    useLayoutEffect(() => {
        trackCustomEvent("iMessage App");
    }, []);

    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
            </head>
            <body
                className={
                    inter.className + "  bg-white dark:bg-zinc-900 text-black"
                }
            >
                <MetaPixelScript />
                <MantineProvider theme={theme}>
                    <Notifications />
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
