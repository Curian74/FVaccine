import { Alert, Typography } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { Icons } from "../Icons";

interface AlertWithContentProps {
    content?: string;
}

const AlertWithContent = ({ content }: AlertWithContentProps) => {
    const [open, setOpen] = React.useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setOpen(false), 5000);
        return () => clearTimeout(timer);
    }, [])

    return (
        <>
            <Alert
                open={open}
                className="max-w-screen-sm bg-green-100"
                icon={<Icons.Success color="green" />}
                onClose={() => setOpen(false)}
            >
                <Typography variant="h5" color="green">
                    Success
                </Typography>
                <Typography className="mt-2 font-medium text-green-600">
                    {content}
                </Typography>
            </Alert>
        </>
    );
}

export default AlertWithContent;