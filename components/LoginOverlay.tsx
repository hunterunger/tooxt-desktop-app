"use client";
import { useAuthState } from "react-firebase-hooks/auth";
import LoginPane from "@/shared/LoginPane";
import { firebaseAuth } from "@/util/firebase/firebaseFrontend";
import { IconX } from "@tabler/icons-react";
import Loader from "@/shared/Loader";

export default function LoginOverlay(props: { onClose?: () => void }) {
    const [user, loading] = useAuthState(firebaseAuth);

    if (user) {
        return null;
    }

    return (
        <div className=" fixed bg-white w-full h-full flex justify-center items-center z-50 backdrop-blur-sm p-3">
            <div className="p-3 bg-white rounded-lg text-black shadow-md container max-w-xl">
                <IconX
                    onClick={props.onClose}
                    className="cursor-pointer opacity-40 mb-4"
                    size={16}
                />
                <div>
                    <img
                        src={"/logo.png?"}
                        className="w-full h-12 mx-auto mb-4 object-contain"
                        alt="logo"
                    />
                </div>
                {loading ? <Loader /> : <LoginPane />}
            </div>
        </div>
    );
}
