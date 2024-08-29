"use client";

import {
    Center,
    PasswordInput,
    SegmentedControl,
    TextInput,
} from "@mantine/core";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { useForm } from "@mantine/form";
import { firebaseAuth } from "@/util/firebase/firebaseFrontend";
import Loader from "./Loader";
import { setUserData } from "@/util/firebase/userData";
import { IconExternalLink } from "@tabler/icons-react";
import { webAppUrl } from "@/util/webAppUrl";

export default function LoginPane() {
    const [user, loading] = useAuthState(firebaseAuth);
    const [loadingLogin, setLoadingLogin] = useState(false);

    const [loginMode, setLoginMode] = useState<"login" | "create" | string>(
        "login"
    );

    const loginForm = useForm({
        initialValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
        },
        validate: {
            email: (value) =>
                /^\S+@\S+$/.test(value) ? null : "Invalid email",
            password: (value) =>
                value.length > 5 ? null : "Password is too short",
        },
    });

    if (loading || loadingLogin) {
        return (
            <Center className="m-12">
                <Loader />
            </Center>
        );
    }

    if (user) {
        return (
            <div className=" rounded-lg border-white">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-4">
                        <h2>Logged in as {user.email}</h2>
                        <button
                            className="mt-4 bg-primary-1 text-primary-light p-2 rounded-lg hover:bg-primary-light hover:text-primary-1 w-full duration-200 border-primary-1 border-2"
                            onClick={() => {
                                const auth = getAuth();
                                auth.signOut();
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <form
                onSubmit={loginForm.onSubmit((v) => {
                    setLoadingLogin(true);
                    if (loginMode === "create") {
                        createUserWithEmailAndPassword(
                            firebaseAuth,
                            loginForm.values.email,
                            loginForm.values.password
                        )
                            .then((userCredential) => {
                                setUserData(userCredential.user.uid, {
                                    name: {
                                        first: loginForm.values.firstName,
                                        last: loginForm.values.lastName,
                                    },
                                });

                                setLoadingLogin(false);
                            })
                            .catch((error) => {
                                setLoadingLogin(false);
                                const errorCode = error.code;
                                const errorMessage = error.message;
                                console.log(
                                    errorCode,
                                    errorMessage + " " + error.code
                                );
                            });
                    } else {
                        signInWithEmailAndPassword(
                            firebaseAuth,
                            loginForm.values.email,
                            loginForm.values.password
                        )
                            .then((userCredential) => {
                                const user = userCredential.user;
                                console.log(user);
                                setLoadingLogin(false);
                            })
                            .catch((error) => {
                                const errorCode = error.code;
                                const errorMessage = error.message;
                                setLoadingLogin(false);

                                if (errorCode === "auth/invalid-credential") {
                                    loginForm.setErrors({
                                        password: "Invalid Credentials",
                                    });
                                } else {
                                    loginForm.setErrors({
                                        email: errorMessage + " " + error.code,
                                    });
                                }
                            });
                    }
                })}
                className="flex flex-col gap-3"
            >
                <SegmentedControl
                    value={loginMode}
                    style={{ width: "100%" }}
                    onChange={(value) => setLoginMode(value)}
                    data={[
                        { label: "Login With Account", value: "login" },
                        { label: "Create Account", value: "create" },
                    ]}
                    bg="none"
                />
                {loginMode === "login" ? (
                    <>
                        <TextInput
                            label="Email"
                            placeholder="Enter your email"
                            type="email"
                            required
                            {...loginForm.getInputProps("email")}
                            className=" font-medium"
                        />
                        <PasswordInput
                            label="Password"
                            placeholder={"Enter your password"}
                            required
                            {...loginForm.getInputProps("password")}
                            className=" font-medium"
                        />
                        <button
                            className="mt-4 bg-primary-1 text-primary-light p-2 rounded-lg hover:bg-primary-light hover:text-primary-1 w-full duration-200 border-primary-1 border-2 text-white"
                            type="submit"
                            color="black"
                        >
                            Login
                        </button>
                    </>
                ) : (
                    <div className="w-full py-12">
                        <a
                            href={webAppUrl + "/create-account"}
                            target="_blank"
                            className=" bg-primary-1 text-white rounded-md p-2 px-4 flex gap-2 items-center font-medium text-lg"
                        >
                            {"Set Up Account"}
                            <IconExternalLink size={24} />
                        </a>
                    </div>
                )}
            </form>
        </div>
    );
}
