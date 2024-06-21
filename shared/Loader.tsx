import { IconLoader2 } from "@tabler/icons-react";
import { JSX, ClassAttributes, HTMLAttributes } from "react";

export default function Loader(
    props: JSX.IntrinsicAttributes &
        ClassAttributes<HTMLDivElement> &
        HTMLAttributes<HTMLDivElement>
) {
    return (
        <div {...props}>
            <IconLoader2
                size={24}
                // spinning animation
                className="spin"
            />
        </div>
    );
}
