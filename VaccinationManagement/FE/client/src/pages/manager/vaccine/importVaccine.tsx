import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VaccineService from '@/services/VaccineService';
import message from '@/helpers/constants/message.json';

const ImportVaccine = () => {
    const [file, setFile] = useState<File | null>(null);
    const [containFile, setContainFile] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file) {
            setContainFile(false);
            setPopupMessage(message["MSG 25"]);
            setPopupVisible(true);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setContainFile(true);
            const data = await VaccineService.ImportVaccine(formData);
            if (data.message === "This vaccine is existed.") {
                setPopupMessage(message["MSG 56"]);
                setContainFile(false);
                handleReset;
            }
            else {
                setPopupMessage(message["MSG 30"]);
            }
            setPopupVisible(true);
        } catch (error : any) {
            setContainFile(false);
            let mess = message["MSG 25"];
            if(error.message === "Error importing vaccines: Incorrect format.") mess = message["MSG 50"];
            setPopupMessage(mess);
            setPopupVisible(true);
        }
    };

    const handleReset = () => {
        setFile(null); 
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        setPopupVisible(false);
        if (containFile) navigate('/vaccine');
    }

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

            <div className="flex justify-center">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-4xl">
                    <h1 className="text-center text-2xl font-bold mb-6">IMPORT VACCINE</h1>
                    <form onSubmit={handleSubmit}>
                        <div className='mr-4'>
                            <label className="block mb-2">Import file</label>
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                className="w-full border border-gray-300 p-2 rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                                ref={fileInputRef}
                            />
                        </div>

                        <div className='flex space-x-80'>
                            <div className="flex space-x-2 mt-10">
                                <button type="submit" className="w-20 bg-green-500 text-white px-4 py-2 rounded">Import</button>
                                <button type="reset" 
                                        className="w-20 bg-blue-500 text-white px-4 py-2 rounded"
                                        onClick={handleReset}>
                                    Reset
                                </button>
                                <button type="button" className="w-20 bg-orange-500 text-white px-4 py-2 rounded" onClick={() => { navigate('/vaccine') }}>Cancel</button>
                            </div>

                            <div className="mt-10">
                                <button
                                    type="button"
                                    className="w-60 bg-cyan-500 text-white px-4 py-2 rounded"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = '/SampleData/ImportVaccine.xlsx'; 
                                        link.download = 'ImportVaccine.xlsx';
                                        link.click();
                                    }}
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

export default ImportVaccine;
