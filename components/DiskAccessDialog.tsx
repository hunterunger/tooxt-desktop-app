"use client";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";
import getPlatform from "./../util/identifyPlatform";
import { IconExternalLink, IconSettings } from "@tabler/icons-react";
import React from "react";

export default function DiskAccessDialog(props: {
    setPermissionSuccess: (value: boolean) => void;
}) {
    /*
    Checks the disk access status. If disk access is not granted, it will prompt the how to grant disk access through macOS settings.
    */

    const [diskAccessStatus, setDiskAccessStatus] = useState<boolean>();
    const [os, setOs] = useState<string>("");

    const checkDiskAccess = async () => {
        let os = await getPlatform();

        if (os && os != "darwin") {
            setDiskAccessStatus(true);
            setOs(os);
            props.setPermissionSuccess(false);
            return;
        }

        const diskAccessStatus = await invoke<any>("test_disk_permission");
        setDiskAccessStatus(diskAccessStatus);
        props.setPermissionSuccess(diskAccessStatus);
    };

    useEffect(() => {
        checkDiskAccess();
    }, []);

    return (
        <>
            {diskAccessStatus === false && (
                <div className=" z-20 w-full h-[100vh] flex flex-col gap-6 justify-center items-center text-center bg-primary-light text-black p-3 mb-3 shadow-md">
                    <h1 className="text-2xl font-bold">
                    Please grant full disk access
                    </h1>
                    <p className="text-center max-w-xl font-medium">
                        {`To create your book, you need to grant full disk access to the app, ensuring Tooxt can securely access your iMessage database - with all your data fully encrypted to protect your privacy at every step.`}
                    </p>
                    <button
                        className="bg-white font-medium text-black rounded-xl shadow-md border border-1 px-6 py-1 flex items-center gap-2"
                        onClick={() => {
                            open(
                                "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles"
                            );
                        }}
                    >
                        Open System Settings
                        <IconExternalLink size={16} />
                    </button>
                    {/* <button
                        // check again
                        className="bg-white text-black rounded-md px-2 py-1 flex items-center gap-2"
                        onClick={() => {
                            checkDiskAccess();
                        }}
                    >
                        <IconRefreshDot size={16} />
                        Check Again
                    </button> */}
                </div>
            )}

            {os != "darwin" && os != "" && (
                <div className=" w-full h-full flex flex-col gap-3 justify-center items-center text-center rounded-md bg-yellow-400 text-black p-3 mb-3 shadow-md">
                    <p>
                        {`Automatic detection of iMessage database is only supported macOS. You can still manually select a database file.`}
                    </p>
                </div>
            )}
        </>
    );
}
