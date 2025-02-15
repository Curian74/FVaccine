import EmployeeService from "@/services/EmployeeService";
import { ChangePassFormData } from "@/types/employee";
import message from "@/helpers/constants/message.json";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Modal, Header, ModalContent, ModalActions, Button, Icon, Message } from "semantic-ui-react";
import * as Yup from 'yup';
import { LOWERCASE_EXP, MIN_LENGTH_EXP, NUMERIC_EXP, SPECIAL_CHAR_EXP, UPPERCASE_EXP } from "@/helpers/constants/constants";
import CustomerService from "@/services/CustomerService";
import { cn } from "@/helpers/utils";

const validationSchema = Yup.object().shape({
    id: Yup.string(),
    currentPassword: Yup.string().required("Old password is required!"),
    newPassWord: Yup.string().required("New password is required!")
        .matches(MIN_LENGTH_EXP, "Password must be at least 8 characters")
        .matches(LOWERCASE_EXP, "Password must contain at least one lowercase letter")
        .matches(UPPERCASE_EXP, "Password must contain at least one uppercase letter")
        .matches(SPECIAL_CHAR_EXP, "Password must contain at least one special character")
        .matches(NUMERIC_EXP, "Password must contain at least one digit"),
    confirmPassword: Yup.string().required("Confirm password is required!")
        .oneOf([Yup.ref("newPassWord")], "Passwords must match"),
});

type ChangePasswordModalProps = {
    isModalOpen: boolean;
    onClose: () => void;
    customerId?: string;
}

const ChangePasswordModal = ({ isModalOpen, onClose, customerId }: ChangePasswordModalProps) => {

    if (!isModalOpen) {
        return <></>;
    }

    const [isError, setIsError] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [open, setOpen] = useState(false);

    const { id } = useParams();

    const { register, handleSubmit, formState: { errors, isValid }, reset, watch, setValue, trigger } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
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

    const openConfirmModal = async () => {
        await trigger();
        if (isValid) {
            setOpen(true);
        }
    }

    const changePassword = async (formData: ChangePassFormData) => {
        try {
            if (customerId) {
                await CustomerService.ChangePassword(formData);
            }
            else {
                await EmployeeService.ChangeEmployeePassword(formData);
            }
            setIsError(false);
            reset({
                currentPassword: "",
                confirmPassword: "",
                newPassWord: "",
            })
            setStatusMessage("Password changed successfully!");
            setOpen(false);

        }

        catch (error: any) {
            const message = error.response.data.message;
            console.log(message);
            setStatusMessage(message);
            setIsError(true);
            setOpen(false);
        }

        finally {
            setTimeout(() => {
                setStatusMessage("")
            }, 5000)
        }
    }

    useEffect(() => {
        setValue("id", id || customerId);
    }, [id])

    return (
        <>
            <Modal
                closeIcon
                size="tiny"
                open={open}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
            >
                <Header content='Confirmation' />
                <ModalContent>
                    <p>{message["MSG 46"]}</p>
                </ModalContent>
                <ModalActions>
                    <Button color='green' onClick={handleSubmit(changePassword)}>
                        <Icon name='checkmark' /> Yes
                    </Button>
                    <Button color='red' onClick={() => setOpen(false)}>
                        <Icon name='remove' /> No
                    </Button>
                </ModalActions>
            </Modal>

            <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full">
                <div
                    className="absolute inset-0 bg-black opacity-50"
                    onClick={onClose}>
                </div>
                <div className="relative p-4 w-full max-w-lg">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Change Password
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg w-8 h-8 flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={onClose}>
                                <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleSubmit(changePassword)} className="space-y-4">
                                <input type="hidden" value={watch("id")} {...register("id")}></input>
                                <div>
                                    <label htmlFor="old-password"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Old Password <span className="text-red-600">*</span>
                                    </label>
                                    <input type="password"
                                        {...register("currentPassword")}
                                        style={{ borderColor: errors.currentPassword ? 'red' : '' }}
                                        className="bg-gray-50 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        placeholder="••••••••"
                                        autoComplete="true" />
                                </div>

                                {errors.currentPassword && (
                                    <div className="ui pointing red basic label">{errors.currentPassword.message}</div>
                                )}

                                <div>
                                    <label htmlFor="new-password"
                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        New Password <span className="text-red-600">*</span>
                                    </label>
                                    <input type="password"
                                        style={{ borderColor: errors.newPassWord ? 'red' : '' }}
                                        {...register("newPassWord")}
                                        className="bg-gray-50 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                                        placeholder="••••••••"
                                        autoComplete="true" />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Confirm Password <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        style={{ borderColor: errors.confirmPassword ? 'red' : '' }}
                                        {...register("confirmPassword")}
                                        autoComplete="true"
                                        className="bg-gray-50 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:text-white" placeholder="••••••••"
                                    />
                                </div>
                                {errors.confirmPassword && (
                                    <div className="ui pointing red basic label">{errors.confirmPassword.message}</div>
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
                                <div className="flex justify-end space-x-4">
                                    <button type="button"
                                        className="px-4 py-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                                        onClick={openConfirmModal}>
                                        Save Changes
                                    </button>
                                    <button type="button"
                                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                        onClick={onClose}>
                                        Cancel
                                    </button>
                                </div>
                            </form>

                            {(!isError && statusMessage) && (
                                <Message success header="Success!" content={statusMessage} />
                            )}

                            {(isError && statusMessage) && (
                                <Message error header="Error!" content={statusMessage} />
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default ChangePasswordModal;