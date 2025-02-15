import React, { useRef, useState } from "react";
import {
    Button,
    Dialog,
    Card,
    CardBody,
    CardFooter,
    Typography,
    Input,
} from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import * as Yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup";
import CustomerService from "@/services/CustomerService";
import DOMPurify from "dompurify";

const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required!"),
})

const COUNTDOWN_TIME_SECOND = 20;

export function ChangeEmail() {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [countdownTime, setCountdownTime] = useState(0);
    const [instructionMessage, setInstructionMessage] = useState("");
    const countdownIntervalRef = useRef(0);
    const handleOpen = () => setOpen((cur) => !cur);
    const email = localStorage.getItem('email');

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            email: email!
        }
    });

    const handleToggleClick = () => {
        if (open) {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = 0;
            }
            setCountdownTime(0);
            setInstructionMessage("");
        }
        setOpen(!open);
        setValue("email", email!);
        setSuccessMessage("");
        setErrorMessage("");
        setInstructionMessage('');
        reset({ email: email! });
        setCountdownTime(0);
    }

    const changeEmail = async (data: { email: string }) => {
        let message;
        try {
            setErrorMessage("");
            setSuccessMessage('');
            setIsLoading(true);
            const dataResponse = await CustomerService.ChangeEmail(email!, data.email);
            message = dataResponse.message;
            setIsLoading(false);
            setSuccessMessage(message);

            let countdown = COUNTDOWN_TIME_SECOND;
            setCountdownTime(COUNTDOWN_TIME_SECOND);

            if (countdown > 0) {
                setInstructionMessage(`If you don't receive the email, resend after ${countdown} seconds`);
                countdownIntervalRef.current = setInterval(() => {
                    countdown--;
                    setCountdownTime(countdown);
                    setInstructionMessage(`If you don't receive the email, resend after ${countdown} seconds`);
                    if (countdown === 0) {
                        clearInterval(countdownIntervalRef.current!);
                        countdownIntervalRef.current = 0;
                        setInstructionMessage('');
                    }
                }, 1000);
            }

        } catch (error: any) {
            setSuccessMessage("");
            setIsLoading(false);
            message = error.response.data.message;
            setErrorMessage(message);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('email', e. target.value);
        setErrorMessage('');
    }

    //Render HTML content
    const createSafeHTML = (html: string) => {
        const sanitized = DOMPurify.sanitize(html);
        return { __html: sanitized };
    };

    const currentEmail = watch("email");
    const isEmailEdited = currentEmail !== email;

    return (
        <>
            <Button onClick={handleOpen} placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}>
                Change Email
            </Button>
            <div>
                <form onSubmit={handleSubmit(changeEmail)}>
                    <Dialog
                        size="lg"
                        open={open}
                        handler={handleOpen}
                        className="bg-transparent shadow-none" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}      >
                        <Card className="mx-auto w-2/5" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            <CardBody className="flex flex-col gap-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                <Typography className="mb-2 font-bold text-black text-xl" variant="h5" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    Your Email
                                </Typography>
                                <Input
                                    label="Email" size="lg"
                                    {...register("email")}
                                    onChange={(e) => handleChange(e)}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    crossOrigin={undefined}
                                    placeholder={email!}
                                    disabled={countdownTime > 0}                                
                                />
                                {isLoading && (
                                    <p>Loading...</p>
                                )}

                                {successMessage && (
                                    <p className="font-medium"
                                        dangerouslySetInnerHTML={createSafeHTML(successMessage)}>
                                    </p>
                                )}

                                {(errorMessage && !errors.email?.message) && (
                                    <p className="font-medium text-red-400"
                                        dangerouslySetInnerHTML={createSafeHTML(errorMessage)}>
                                    </p>
                                )}

                                {instructionMessage && (
                                    <p className="font-medium text-sm text-green-500">
                                        {instructionMessage}
                                    </p>
                                )}

                                {errors.email?.message && (
                                    <p className="text-red-400">{errors.email.message}</p>
                                )}

                            </CardBody>
                            <CardFooter className="pt-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                <div className="flex justify-end">
                                    <Button className="mr-3" placeholder={undefined}
                                        color="teal"
                                        onPointerEnterCapture={undefined}
                                        onPointerLeaveCapture={undefined}
                                        disabled={!isEmailEdited || isLoading || countdownTime > 0}
                                        onClick={handleSubmit(changeEmail)}>
                                        Send instructions
                                    </Button>

                                    <Button className="" placeholder={undefined}
                                        color="blue-gray"
                                        onPointerEnterCapture={undefined}
                                        onPointerLeaveCapture={undefined}
                                        onClick={handleToggleClick}>
                                        Cancel
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </Dialog>
                </form>
            </div>
        </>
    );
}
