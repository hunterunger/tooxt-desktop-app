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
import tauriWindow from "@/util/tauriWindow";

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
                    inter.className + " text-black flex flex-col h-screen"
                }
            >
                <MetaPixelScript />
                <MantineProvider theme={theme} cssVariablesResolver={(theme) => ({
                    variables: {
                    },
                    light: {
                        '--mantine-color-body': "inherit",
                    },
                    dark: {
                        '--mantine-color-body': "inherit",
                    },
                    })}>
                        <div
                            onMouseDown={async (e) => {
                                const appWindow = await tauriWindow();
                                if (!appWindow) return;

                                if (e.buttons === 1) {
                                // Primary (left) button
                                e.detail === 2
                                    ? appWindow.toggleMaximize() // Maximize on double click
                                    : appWindow.startDragging(); // Else start dragging
                                }
                            }}
                            className="fixed z-50 top-0 left-0 w-full h-8 bg-transparent"
                        >

                        </div>
                    <Notifications />
                    {children}
                </MantineProvider>
            </body>
        </html>
    );
}
