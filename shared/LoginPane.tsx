"use client";

import {
    Button,
    Loader,
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
            <div className="flex flex-col gap-4 p-3">
                <Loader color="black" size="sm" variant="dots" />
            </div>
        );
    }

    if (user) {
        return (
            <div className=" rounded-lg border-white">
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-4">
                        <h2 className="">Logged in as {user.email}</h2>
                        <button
                            className="bg-white shadow-md text-black p-1"
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
            >
                <SegmentedControl
                    value={loginMode}
                    style={{ width: "100%" }}
                    onChange={(value) => setLoginMode(value)}
                    data={[
                        { label: "Login With Account", value: "login" },
                        { label: "Create Account", value: "create" },
                    ]}
                />
                <TextInput
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    // required
                    {...loginForm.getInputProps("email")}
                />
                <PasswordInput
                    label="Password"
                    placeholder={
                        loginMode === "create"
                            ? "Create a password"
                            : "Enter your password"
                    }
                    // required
                    {...loginForm.getInputProps("password")}
                />
                <Button
                    mt={"md"}
                    fullWidth
                    variant="outline"
                    type="submit"
                    color="black"
                >
                    {loginMode === "create" ? "Create Account" : "Login"}
                </Button>
            </form>
        </div>
    );
}
