import { Stepper } from "@mantine/core";

export default function ProgressStepper(props: { step: number }) {
    return (
        <Stepper
            active={props.step}
            className="w-full dark:text-white "
            color="#f64e43"
            size="sm"
        >
            <Stepper.Step
                label="Select Chat"
                description="Step 1"
            ></Stepper.Step>
            <Stepper.Step
                label="Select Timeframe"
                description="Step 2"
            ></Stepper.Step>
            <Stepper.Step label="Upload" description="Step 3"></Stepper.Step>
            {/* <Stepper.Completed>
                
            </Stepper.Completed> */}
        </Stepper>
    );
}
