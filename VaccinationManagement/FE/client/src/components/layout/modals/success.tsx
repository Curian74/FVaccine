import { useEffect, useState } from "react";

interface SuccessProps {
    message: string;
}

const Success = ({ message }: SuccessProps) => {
    const [isModalOpen, setIsModalOpen] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsModalOpen(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [message]);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            {isModalOpen && (
                <div
                    id="successModal"
                    aria-hidden="false"
                    className="overflow-y-auto overflow-x-hidden fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50"
                >
                    <div className="relative p-4 w-full max-w-xl h-80">
                        <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <svg
                                    aria-hidden="true"
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 p-2 flex items-center justify-center mx-auto mb-3.5">
                                <svg
                                    aria-hidden="true"
                                    className="w-8 h-8 text-green-500 dark:text-green-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                <span className="sr-only">Success</span>
                            </div>
                            <p className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{message}</p>
                            <button
                                type="button"
                                className="py-2 px-3 text-sm font-medium text-center text-white rounded-lg bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:focus:ring-primary-900"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Success;
