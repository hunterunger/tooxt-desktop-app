"use client";

import { logError } from "@/util/logging";
import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logError(error.message, error.digest);
    }, []);

    return (
        <html>
            <body>
                <h2>Something went wrong!</h2>
                <code>
                    {error.message}
                    {error.digest && <p>Digest: {error.digest}</p>}
                </code>
                <button onClick={() => reset()}>Try again</button>
            </body>
        </html>
    );
}
