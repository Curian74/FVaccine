import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeService from '@/services/EmployeeService';
import message from '@/helpers/constants/message.json';

const ImportEmployees = () => {
    const [file, setFile] = useState<File | null>(null);
    const [containFile, setContainFile] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        setIsLoading(true);
        event.preventDefault();

        if (!file) {
            setContainFile(false);
            setPopupMessage(message["MSG 25"]);
            setPopupVisible(true);
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setContainFile(true);
            await EmployeeService.ImportEmployee(formData);
            setPopupMessage(message["MSG 30"]);
            setPopupVisible(true);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error || "Failed to import employee. Please try again!";
            setContainFile(false);
            setPopupMessage(errorMessage);
            setPopupVisible(true);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setPopupVisible(false);
        if (containFile) navigate('/employee');
    }

    const handleDownloadSampleFile = async () => {
        await EmployeeService.DownloadSampleFile();
    };

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

            <div className="flex justify-center">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl">
                    <h1 className="text-center text-2xl font-bold mb-6">IMPORT EMPLOYEE</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mr-4">
                            <label className="block mb-2">Import file</label>
                            <input
                                type="file"
                                accept=".xls,.xlsx"
                                onChange={handleFileChange}
                                className="w-full border border-gray-300 p-2 rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                            />
                        </div>

                        {isLoading && (
                            <p className="mt-3">Loading...</p>
                        )}

                        <div className="flex space-x-80">
                            <div className="flex space-x-2 mt-10">
                                <button type="submit" className="w-20 bg-green-500 text-white px-4 py-2 rounded">Import</button>
                                <button onClick={() => setFile(null)} type="reset" className="w-20 bg-blue-500 text-white px-4 py-2 rounded">Reset</button>
                                <button type="button" className="w-20 bg-orange-500 text-white px-4 py-2 rounded" onClick={() => { navigate('/employee') }}>Cancel</button>
                            </div>

                            <div className="mt-10">
                                <button
                                    type="button"
                                    className="w-60 bg-cyan-500 text-white px-4 py-2 rounded"
                                    onClick={handleDownloadSampleFile}
                                >
                                    Download Format File
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {isPopupVisible && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p>{popupMessage}</p>
                        <div className="mt-4 text-center">
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                                onClick={handleClose}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );


};

export default ImportEmployees;
