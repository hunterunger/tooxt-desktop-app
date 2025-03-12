"use client";

import { createTheme, MantineColorsTuple } from "@mantine/core";
import { colours } from "./colours";


const mantineColors = (color: string): MantineColorsTuple => {
    return [
        color,
        color,
        color,
        color,
        color,
        color,
        color,
        color,
        color,
        color,
    ];
};

export const theme = createTheme({
    /* Put your mantine theme override here */
    colors: {
        red: mantineColors(colours["primary-1"]),
    },
    primaryColor: "red",
    
});
