import React, { useEffect, useState } from "react";
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
import { Customer } from "@/types/user";
import { Message } from "semantic-ui-react";
import { LOWERCASE_EXP, MIN_LENGTH_EXP, NUMERIC_EXP, SPECIAL_CHAR_EXP, UPPERCASE_EXP } from "@/helpers/constants/constants";
import { AxiosError } from "axios";
import { Response } from "@/types/response";
import { ChangePassFormData } from "@/types/employee";
import { cn } from "@/helpers/utils";

const validationSchema = Yup.object().shape({
    id: Yup.string().required(""),
    currentPassword: Yup.string().required("Old password is required!"),
    newPassWord: Yup.string().required("New Password is required!")
        .matches(MIN_LENGTH_EXP, "Password must be at least 8 characters")
        .matches(LOWERCASE_EXP, "Password must contain at least one lowercase letter")
        .matches(UPPERCASE_EXP, "Password must contain at least one uppercase letter")
        .matches(SPECIAL_CHAR_EXP, "Password must contain at least one special character")
        .matches(NUMERIC_EXP, "Password must contain at least one digit"),
    confirmPassword: Yup.string()
        .required("Confirm password is required!")
        .oneOf([Yup.ref("newPassWord")], "Passwords must match"),
})

export function ChangePassword() {
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [changePassMessage, setChangePassMessage] = useState("");
    const [isPasswordError, setIsPasswordError] = useState(false);
    const [customer, setCustomer] = useState<Customer>();
    const handleOpen = () => setOpen((cur) => !cur);

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const password = watch("newPassWord", "");

    const requirements = [
        {
            message: "At least 8 characters",
            isValid: MIN_LENGTH_EXP.test(password),
        },
        {
            message: "At least one lowercase letter",
            isValid: LOWERCASE_EXP.test(password),
        },
        {
            message: "At least one uppercase letter",
            isValid: UPPERCASE_EXP.test(password),
        },
        {
            message: "At least one special character",
            isValid: SPECIAL_CHAR_EXP.test(password),
        },
        {
            message: "At least one numeric character",
            isValid: NUMERIC_EXP.test(password),
        },
    ];

    const handleToggleClick = () => {
        setOpen(!open);
        reset({
            currentPassword: "",
            newPassWord: "",
            confirmPassword: "",
        })
        setChangePassMessage("");
    }

    useEffect(() => {
        const getCustomerByEmail = async () => {
            try {
                const data = await CustomerService
                    .GetCustomerByEmail(localStorage.getItem('email')!);
                setCustomer(data);
                setValue("id", data.id);
            }
            catch (error) {
                const e = error as AxiosError
                console.log((e?.response?.data as Response)?.message || e.message);
            }
        }
        getCustomerByEmail();
    }, [])

    const changePassword = async (data: ChangePassFormData) => {
        try {
            setIsLoading(true);
            await CustomerService.ChangePassword(data);
            setIsPasswordError(false);
            setIsLoading(false);
            setChangePassMessage("Password changed successfully!");
            reset({
                currentPassword: "",
                newPassWord: "",
                confirmPassword: "",
            })

        } catch (error) {
            setIsPasswordError(true);
            const e = error as AxiosError
            setChangePassMessage((e.response?.data as Response).message || e.message);
            setIsLoading(false);
        }

        finally {
            setTimeout(() => {
                setChangePassMessage('');
            }, 5000)
        }
    }

    return (
        <>
            <Button onClick={handleOpen} placeholder={undefined}
                onPointerEnterCapture={undefined}
                onPointerLeaveCapture={undefined}>
                Change Password
            </Button>
            <div>
                <form onSubmit={handleSubmit(changePassword)}>
                    <input type="hidden" value={customer?.id} {...register("id")}></input>
                    <Dialog
                        size="lg"
                        open={open}
                        handler={handleOpen}
                        className="bg-transparent shadow-none" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}      >
                        <Card className="mx-auto w-2/5" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            <CardBody className="flex flex-col gap-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                <Typography className="mb-2 font-bold text-black text-xl" variant="h5" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    Change Password
                                </Typography>
                                <Input
                                    type="password"
                                    label="Old password" size="lg"
                                    {...register("currentPassword")}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    crossOrigin={undefined}
                                />
                                {errors.currentPassword?.message && (
                                    <p className="text-red-400">{errors.currentPassword.message}</p>
                                )}

                                <Input
                                    type="password"
                                    label="New password" size="lg"
                                    {...register("newPassWord")}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    crossOrigin={undefined}
                                />

                                {errors.newPassWord?.message && (
                                    <p className="text-red-400">{errors.newPassWord.message}</p>
                                )}

                                <Input
                                    type="password"
                                    label="Confirm password" size="lg"
                                    {...register("confirmPassword")}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    crossOrigin={undefined}
                                />

                                {errors.confirmPassword?.message && (
                                    <p className="text-red-400">{errors.confirmPassword.message}</p>
                                )}

                                {isLoading && (
                                    <p>Loading...</p>
                                )}

                                <ul className="mb-1 space-y-1">
                                    {requirements.map((req, index) => (
                                        <li
                                            key={index}
                                            className={cn(
                                                "text-sm flex items-center",
                                                req.isValid ? "text-green-600" : "text-red-600"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "w-2.5 h-2.5 mr-2 rounded-full",
                                                    req.isValid ? "bg-green-600" : "bg-red-600"
                                                )}
                                            ></span>
                                            {req.message}
                                        </li>
                                    ))}
                                </ul>

                                {(!isPasswordError && changePassMessage) && (
                                    <Message className="col-span-2" success header="Success!" content={changePassMessage} />
                                )}

                                {(isPasswordError && changePassMessage) && (
                                    <Message className="col-span-2" error header="Error!" content={changePassMessage} />
                                )}

                            </CardBody>
                            <CardFooter className="pt-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                <div className="flex justify-end">
                                    <Button className="mr-3" placeholder={undefined}
                                        color="teal"
                                        onPointerEnterCapture={undefined}
                                        onPointerLeaveCapture={undefined}
                                        onClick={handleSubmit(changePassword)}>
                                        Save changes
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
