import VaccineService from '@/services/VaccineService';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import message from '@/helpers/constants/message.json';
import VaccineTypeService from '@/services/VaccineTypeService';
import { VaccineType } from '@/types/vaccineType';
import { AxiosError } from 'axios';
import { Response } from '@/types/response';
import { Dropdown } from 'semantic-ui-react';

const UpdateVaccine = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [firstErrorField, setFirstErrorField] = useState<string | null>(null);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isConfirmAction, setComfirmAction] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
    const baseURL = import.meta.env.VITE_BASE_URL;

    const idRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const typeRef = useRef<HTMLSelectElement>(null);
    const numberRef = useRef<HTMLInputElement>(null);
    const purchaseRef = useRef<HTMLInputElement>(null);
    const sellingRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLInputElement | null>(null);
    const requiredInjRef = useRef<HTMLInputElement | null>(null);
    const timeBetweenRef = useRef<HTMLInputElement | null>(null);
    const originRef = useRef<HTMLInputElement>(null);

    const location = useLocation();
    const navigate = useNavigate();

    const selectedVaccine = location.state?.vaccine;

    //Image handle
    const [previewImage, setPreviewImage] = useState<string>(baseURL + selectedVaccine.image);
    const [fileImage, setFileImage] = useState<File | null>();

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    let today = getCurrentDate();
    const [vaccineData, setVaccineData] = useState({
        id: '',
        vaccine_Name: '',
        vaccine_Type_Id: '',
        number_Of_Injection: null,
        usage: '',
        indication: '',
        contraindication: '',
        time_Begin_Next_Injection: today,
        time_End_Next_Injection: today,
        time_Between_Injections: null as number | null,
        required_Injections: 0,
        origin: '',
        status: true,
        purchase_Price: null,
        selling_Price: null,
        image: '',
        description: '',
    });

    //Fetch Vaccine Types
    const fetchVaccineTypes = async () => {
        try {
            const data: VaccineType[] = await VaccineTypeService.GetAllVaccineTypes();
            setVaccineTypes(data || []);
            console.log(selectedVaccine);

        } catch (e) {
            const error = e as AxiosError
            setError((error?.response?.data as Response)?.message || error.message);
        }
    };

    useEffect(() => {
        setLoading(true);
        if (selectedVaccine) {
            setVaccineData({
                id: selectedVaccine.id,
                vaccine_Name: selectedVaccine.vaccine_Name,
                vaccine_Type_Id: selectedVaccine.vaccine_Type_Id,
                number_Of_Injection: selectedVaccine.number_Of_Injection,
                usage: selectedVaccine.usage,
                indication: selectedVaccine.indication,
                contraindication: selectedVaccine.contraindication,
                time_Begin_Next_Injection: selectedVaccine.time_Begin_Next_Injection,
                time_End_Next_Injection: selectedVaccine.time_End_Next_Injection,
                time_Between_Injections: selectedVaccine.time_Between_Injections,
                required_Injections: selectedVaccine.required_Injections,
                origin: selectedVaccine.origin,
                status: selectedVaccine.status,
                purchase_Price: selectedVaccine.purchase_Price,
                selling_Price: selectedVaccine.selling_Price,
                image: selectedVaccine.image,
                description: selectedVaccine.description,
            });
        }
        if (!selectedVaccine.image) setPreviewImage("");
        fetchVaccineTypes();
        setLoading(false);

    }, [selectedVaccine]);

    // Format number with commas or dots for display
    const formatNumber = (value: number | null) => {
        if (value === null || isNaN(value)) return "";
        return value.toLocaleString("vi-VN"); // Adjust locale for different formats (e.g., 'en-US' for commas)
    };

    // Remove formatting to parse the number
    const parseFormattedNumber = (value: string) => {
        return parseInt(value.replace(/[^0-9]/g, ""), 10); // Remove non-numeric characters
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        var { name, value } = e.target;

        console.log(vaccineData);
        if (name === "purchase_Price" || name === "selling_Price") {
            const parsedValue = parseFormattedNumber(value);
            setVaccineData(prevState => ({
                ...prevState,
                [name]: !isNaN(parsedValue) ? parsedValue : null,
            }));
        } else {
            var l = value.length - 1;
            if(value[l] === ' ' && (l == 0 || value[l-1] === ' ')) value = value.slice(0,l);
            setVaccineData(prevState => ({
                ...prevState,
                [name]: (name === "number_Of_Injection" || name === "required_Injections" || name === "time_Between_Injections") ? (!isNaN(parseInt(value)) ? parseInt(value) : null) : value
            }));
        }
        setValidationErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file!.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
            event.target.value = "";
            setPreviewImage("");
            setFileImage(null)
            return;
        }

        if (file) {
            try {
                setPreviewImage(URL.createObjectURL(file));
                setFileImage(file);
            } catch (error) {
                console.error("Image upload failed:", error);
            }
        }
    };

    // Mock function for uploading image
    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(baseURL + "/api/Vaccine/upload-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data = await response.json();

        setVaccineData(prev => ({ ...prev, image: data.url, }));

        return data.url;
    };

    useEffect(() => {
        if (firstErrorField) {
            if (firstErrorField === "id") idRef.current?.focus();
            else if (firstErrorField === "vaccine_Name") nameRef.current?.focus();
            else if (firstErrorField === "vaccine_Type_Id") typeRef.current?.focus();
            else if (firstErrorField === "number_Of_Injection") numberRef.current?.focus();
            else if (firstErrorField === "required_Injections") requiredInjRef.current?.focus();
            else if (firstErrorField === "time_Between_Injections") timeBetweenRef.current?.focus();
            else if (firstErrorField === "origin") originRef.current?.focus();
            else if (firstErrorField === "purchase_Price") purchaseRef.current?.focus();
            else if (firstErrorField === "selling_Price") sellingRef.current?.focus();
        }
    }, [firstErrorField]);

    const validateForm = async () => {
        const errors: { [key: string]: string } = {};
        if (!vaccineData.vaccine_Name) errors.vaccine_Name = "Vaccine name is required.";
        if (!vaccineData.vaccine_Type_Id) errors.vaccine_Type_Id = "Vaccine type is required.";
        if (vaccineData.number_Of_Injection == 0) errors.number_Of_Injection = "Number Of Injection must be at least 1.";
        else if (!vaccineData.number_Of_Injection) errors.number_Of_Injection = "Number Of Injection is required.";
        if (!vaccineData.id) errors.id = "Vaccine ID is required.";
        if (vaccineData.required_Injections == 0) errors.required_Injections = "Required Injections must be at least 1.";
        else if (!vaccineData.required_Injections) errors.required_Injections = "Required Injections is required.";
        if (vaccineData.required_Injections > 1 && !vaccineData.time_Between_Injections) errors.time_Between_Injections = "Time Between Injections is required when Required Injections is greater than 1.";
        if (vaccineData.time_End_Next_Injection <= vaccineData.time_Begin_Next_Injection) errors.time_End_Next_Injection = "Expiry Date must not be earlier than Manufacturing Date.";
        if (!vaccineData.origin) errors.origin = "Origin is required.";
        if (!vaccineData.purchase_Price) errors.purchase_Price = "Purchase Price is required.";
        if (!vaccineData.selling_Price) errors.selling_Price = "Selling Price is required.";
        if (vaccineData.selling_Price && vaccineData.purchase_Price && (vaccineData.selling_Price <= vaccineData.purchase_Price)) errors.selling_Price = "Selling Price must be higher than Purchase Price.";

        setValidationErrors(errors);

        const firstError = Object.keys(errors)[0] || null;
        setFirstErrorField(firstError);

        return Object.keys(errors).length === 0;
    };

    const handleResetButton = async () => {
        setPopupMessage(message["MSG 44"]);
        setPopupVisible(true);
        setComfirmAction(true);
    };

    const handleReset = async () => {
        setPopupVisible(false);

        setVaccineData({
            id: selectedVaccine.id,
            vaccine_Name: selectedVaccine.vaccine_Name,
            vaccine_Type_Id: selectedVaccine.vaccine_Type_Id,
            number_Of_Injection: selectedVaccine.number_Of_Injection,
            usage: selectedVaccine.usage,
            indication: selectedVaccine.indication,
            contraindication: selectedVaccine.contraindication,
            time_Begin_Next_Injection: selectedVaccine.time_Begin_Next_Injection,
            time_End_Next_Injection: selectedVaccine.time_End_Next_Injection,
            time_Between_Injections: selectedVaccine.time_Between_Injections,
            required_Injections: selectedVaccine.required_Injections,
            origin: selectedVaccine.origin,
            status: selectedVaccine.status,
            purchase_Price: selectedVaccine.purchase_Price,
            selling_Price: selectedVaccine.selling_Price,
            image: selectedVaccine.image,
            description: selectedVaccine.description,
        });
        if (imageRef.current) {
            imageRef.current.value = "";
        }
        if (!selectedVaccine.image) setPreviewImage("");
        else setPreviewImage(baseURL + selectedVaccine.image);
        setFileImage(null);

        setValidationErrors({});
        setFirstErrorField(null);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSubmit) {
            setFirstErrorField(null);
            return;
        }

        let finalVaccineData = { ...vaccineData };

        if (fileImage) {
            const upImage = await uploadImage(fileImage);
            if (upImage) {
                finalVaccineData.image = upImage;
            }
        }

        try {
            const data = await VaccineService.UpdateVaccine(finalVaccineData);
            if (data.message === "This vaccine is existed.") {
                setPopupMessage(message["MSG 56"]);
            }
            else {
                console.log('Vaccine updated successfully:', data);
                setPopupMessage(message["MSG 22"]);
                setIsSuccess(true);
            }
            setComfirmAction(false);
            setPopupVisible(true);
        } catch (error) {
            console.error('Error updating vaccine:', error);
        }
    };

    const handleConfirmSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) {
            setPopupVisible(false);
            setIsSubmit(false);
            setFirstErrorField(null);
            return;
        }

        setIsSubmit(true);
        setPopupMessage(message["MSG 45"]);
        setComfirmAction(true);
        setPopupVisible(true);
    }

    const handleClose = () => {
        setPopupVisible(false);
        setIsSubmit(false);
        console.log(isSuccess);
        if (isSuccess) {
            navigate('/vaccine');
        }
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

            <div className="flex justify-center">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-5xl">
                    <h1 className="text-center text-2xl font-bold mb-6">UPDATE VACCINE</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-4 gap-4 mb-4 flex items-center">
                            <div className="col-span-3 mr-16">
                                <label className="block mb-2">Vaccine id(<span className="text-red-500">*</span>):</label>
                                <input name="id" value={vaccineData.id} onChange={handleInputChange} type="text" ref={idRef}
                                    className="w-full border border-gray-300 p-2 rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                                    disabled required />
                                {validationErrors.id && <div className="ui pointing red basic label">{validationErrors.id}</div>}
                            </div>
                            <div className="">
                                <label className="block mr-2">Active(<span className="text-red-500">*</span>):</label>
                                <i className="fas fa-vial mr-2"></i>
                                <input type="checkbox" name="status" checked={vaccineData.status} onChange={(e) => setVaccineData(prev => ({ ...prev, status: e.target.checked }))} className="form-checkbox" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block mb-2">Vaccine Name(<span className="text-red-500">*</span>):</label>
                                <input name="vaccine_Name" value={vaccineData.vaccine_Name} onChange={handleInputChange} type="text" ref={nameRef}
                                    className="w-full border border-gray-300 p-2 rounded" />
                                {validationErrors.vaccine_Name && <div className="ui pointing red basic label">{validationErrors.vaccine_Name}</div>}
                            </div>
                            <div>
                                <label className="block mb-2">Vaccine Type(<span className="text-red-500">*</span>):</label>
                                <Dropdown
                                    placeholder="Select Vaccine Type"
                                    fluid
                                    search
                                    selection
                                    value={vaccineData.vaccine_Type_Id}
                                    onChange={(_, { value }) => handleInputChange({ target: { name: 'vaccine_Type_Id', value } } as React.ChangeEvent<HTMLInputElement>)}
                                    options={vaccineTypes.map(vaccineType => ({
                                        key: vaccineType.id,
                                        value: vaccineType.id,
                                        text: vaccineType.vaccine_Type_Name,
                                    }))}
                                />
                                {validationErrors.vaccine_Type_Id && <div className="ui pointing red basic label">{validationErrors.vaccine_Type_Id}</div>}
                            </div>
                            <div>
                                <label className="block mb-2">Number of injection(<span className="text-red-500">*</span>):</label>
                                <input name="number_Of_Injection" value={vaccineData.number_Of_Injection ?? ''}
                                    ref={numberRef}
                                    onChange={handleInputChange} type="text" className="w-full border border-gray-300 p-2 rounded" />
                                {validationErrors.number_Of_Injection && <div className="ui pointing red basic label">{validationErrors.number_Of_Injection}</div>}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block mb-2">Required Injection(<span className="text-red-500">*</span>):</label>
                                <input name="required_Injections" value={vaccineData.required_Injections ?? ''} ref={requiredInjRef}
                                    onChange={handleInputChange} type="text" className="w-full border border-gray-300 p-2 rounded" />
                                {validationErrors.required_Injections && <div className="ui pointing red basic label">{validationErrors.required_Injections}</div>}
                            </div>

                            <div>
                                <label className="block mb-2">Time between Injections:</label>
                                <div className='flex'>
                                    <input name="time_Between_Injections" value={vaccineData.time_Between_Injections ?? ''} ref={timeBetweenRef}
                                        onChange={handleInputChange} type="text" className="w-full border border-gray-300 p-2 rounded" />
                                    <input disabled placeholder='Days' className='border border-gray-300 p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 w-14'></input>
                                </div>
                                {validationErrors.time_Between_Injections && <div className="ui pointing red basic label">{validationErrors.time_Between_Injections}</div>}
                            </div>

                            <div></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block mb-2">Usage:</label>
                                <textarea name="usage" value={vaccineData.usage} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded h-24 resize-none"></textarea>
                            </div>
                            <div>
                                <label className="block mb-2">Indication:</label>
                                <textarea name="indication" value={vaccineData.indication} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded h-24 resize-none"></textarea>
                            </div>
                            <div>
                                <label className="block mb-2">Contraindication:</label>
                                <textarea name="contraindication" value={vaccineData.contraindication} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded h-24 resize-none"></textarea>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block mb-2">Time of Manufacturing Date:</label>
                                <input name="time_Begin_Next_Injection" value={vaccineData.time_Begin_Next_Injection}
                                    max={today}
                                    onChange={handleInputChange} type="date" className="w-full border border-gray-300 p-2 rounded" />
                            </div>
                            <div>
                                <label className="block mb-2">Time of Expiry Date:</label>
                                <input name="time_End_Next_Injection" value={vaccineData.time_End_Next_Injection}
                                    onChange={handleInputChange} type="date" className="w-full border border-gray-300 p-2 rounded" />
                                {validationErrors.time_End_Next_Injection && <div className="ui pointing red basic label">{validationErrors.time_End_Next_Injection}</div>}
                            </div>
                            <div>
                                <label className="block mb-2">Origin(<span className="text-red-500">*</span>):</label>
                                <input name="origin" value={vaccineData.origin} onChange={handleInputChange} ref={originRef}
                                    type="text" className="w-full border border-gray-300 p-2 rounded" />
                                {validationErrors.origin && <div className="ui pointing red basic label">{validationErrors.origin}</div>}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block mb-2">Purchase Price(<span className="text-red-500">*</span>):</label>
                                <div className='flex'>
                                    <input name="purchase_Price"
                                        value={formatNumber(vaccineData.purchase_Price)}
                                        onChange={handleInputChange}
                                        ref={purchaseRef}
                                        type="text" className="w-full border border-gray-300 p-2 rounded" />
                                    <input disabled placeholder='VND' className='border border-gray-300 p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 w-14'></input>
                                </div>
                                {validationErrors.purchase_Price && <div className="ui pointing red basic label">{validationErrors.purchase_Price}</div>}
                            </div>
                            <div>
                                <label className="block mb-2">Selling Price(<span className="text-red-500">*</span>):</label>
                                <div className='flex'>
                                    <input name="selling_Price"
                                        value={formatNumber(vaccineData.selling_Price)}
                                        onChange={handleInputChange}
                                        ref={sellingRef}
                                        type="text" className="w-full border border-gray-300 p-2 rounded" />
                                    <input disabled placeholder='VND' className='border border-gray-300 p-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 w-14'></input>
                                </div>
                                {validationErrors.selling_Price && <div className="ui pointing red basic label">{validationErrors.selling_Price}</div>}
                            </div>
                            <div>
                                <label className="block mb-2">Image:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={imageRef}
                                    onChange={handleImageUpload}
                                    className="w-full border border-gray-300 p-1 rounded"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className='col-span-2'>
                                <label className="block mb-2">Description:</label>
                                <textarea name="description" value={vaccineData.description} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded h-24 resize-none"></textarea>
                            </div>
                            {previewImage && (
                                <div>
                                    <p className='mb-2'>Preview:</p>
                                    <img
                                        src={previewImage}
                                        alt="Uploaded Preview"
                                        className="max-w-xs border rounded h-24"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex space-x-2 mt-10">
                            <button type="submit" className="w-20 bg-green-500 text-white px-4 py-2 rounded"
                                onClick={handleConfirmSubmit}
                            >Save</button>
                            <button type="button" className="w-20 bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={handleResetButton}>Reset</button>
                            <button type="button" className="w-20 bg-orange-500 text-white px-4 py-2 rounded" onClick={() => { navigate('/vaccine') }}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            {isPopupVisible && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p>{popupMessage}</p>
                        <div className="mt-4 text-center">
                            {isConfirmAction ? (
                                <>
                                    <button
                                        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                                        onClick={isSubmit ? handleSubmit : handleReset}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded"
                                        onClick={handleClose}
                                    >
                                        No
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                    onClick={handleClose}
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}

export default UpdateVaccine;