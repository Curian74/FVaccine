import { useEffect, useRef, useState } from 'react';
import VaccineService from '@/services/VaccineService';
import VaccineTypeService from '@/services/VaccineTypeService';
import { Response } from '@/types/response';
import { useNavigate } from 'react-router-dom';
import message from '@/helpers/constants/message.json';
import formatid from '@/helpers/constants/FormatID.json';
import { AxiosError } from 'axios';
import { VaccineType } from '@/types/vaccineType';
import * as Yup from 'yup';
import 'semantic-ui-css/semantic.min.css';
import { Dropdown } from 'semantic-ui-react';

// Define Yup schema
const vaccineSchema = Yup.object().shape({
    id: Yup.string().required("Vaccine ID is required."),
    vaccine_Name: Yup.string().required("Vaccine name is required."),
    vaccine_Type_Id: Yup.string().required("Vaccine type is required."),
    number_Of_Injection: Yup.number()
        .required("Number Of Injection is required.")
        .min(1, "Number Of Injection must be at least 1."),
    required_Injections: Yup.number()
        .required("Required Injections is required.")
        .min(1, "Required Injections must be at least 1."),
    time_Between_Injections: Yup.number()
        .nullable()
        .when("required_Injections", {
            is: (value: number) => value > 1,
            then: schema => schema.required("Time Between Injections is required when Required Injections is greater than 1."),
            otherwise: schema => schema.nullable(),
        }),
    time_Begin_Next_Injection: Yup.date().required("Start date is required."),
    time_End_Next_Injection: Yup.date()
        .required("End date is required.")
        .test(
            "is-after-start",
            "Expiry date must be later than Manufacturing date.",
            function (value) {
                const { time_Begin_Next_Injection } = this.parent; // Access other fields using `this.parent`
                return value && time_Begin_Next_Injection && value > time_Begin_Next_Injection;
            }
        ),
    origin: Yup.string().required("Origin is required."),
    purchase_Price: Yup.number()
        .required("Purchase Price is required.")
        .min(1, "Purchase Price must be a positive number."),
    selling_Price: Yup.number()
        .required("Selling Price is required.")
        .min(1, "Selling Price must be a positive number.")
        .test(
            "is-higher-than-purchase",
            "Selling Price must be higher than Purchase Price.",
            function (value) {
                const { purchase_Price } = this.parent; // Access other fields using `this.parent`
                return value && purchase_Price && value > purchase_Price;
            }
        ),
});

const AddVaccine = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [firstErrorField, setFirstErrorField] = useState<string | null>(null);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isConfirmAction, setComfirmAction] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [added, setAdded] = useState(false);
    const baseURL = import.meta.env.VITE_BASE_URL;

    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
    const [hasVaccineType, setHasVaccineType] = useState(false);

    const idRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const typeRef = useRef<HTMLInputElement>(null);
    const numberRef = useRef<HTMLInputElement>(null);
    const purchaseRef = useRef<HTMLInputElement>(null);
    const sellingRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLInputElement | null>(null);
    const requiredInjRef = useRef<HTMLInputElement | null>(null);
    const timeBetweenRef = useRef<HTMLInputElement | null>(null);
    const originRef = useRef<HTMLInputElement>(null);

    //Image handle
    const [previewImage, setPreviewImage] = useState<string>();
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
        purchase_Price: null as number | null,
        selling_Price: null as number | null,
        image: '',
        description: '',
    });

    useEffect(() => {
        setLoading(true);

        fetchNewVaccineId();
        fetchVaccineTypes();

        setLoading(false);
    }, []);

    // Fetch the new ID when the component mounts
    const fetchNewVaccineId = async () => {
        try {
            let latestId = await VaccineService.GenerateVaccineId();
            if (latestId === "Null") latestId = formatid["Vaccine"];
            const prefix = formatid["Vaccine"].slice(0, 2);
            const suffix = latestId.slice(2);

            const nextSuffix = (parseInt(suffix, 10) + 1).toString();
            const paddedSuffix = nextSuffix.padStart(formatid["Vaccine"].length - 2, '0');

            const nextId = `${prefix}${paddedSuffix}`;
            console.log(nextId);
            setVaccineData(prevState => ({
                ...prevState,
                id: nextId
            }));
        } catch (error) {
            console.error('Error generating new vaccine ID:', error);
        }
    };

    // Fetch Vaccine Types
    const fetchVaccineTypes = async () => {
        try {
            const data: VaccineType[] = await VaccineTypeService.GetAllVaccineTypes();
            if (data === null || data.length == 0) {
                setHasVaccineType(false);
                setPopupMessage(message["MSG 40"]);
                setPopupVisible(true);
            } else {
                setHasVaccineType(true);
            }
            setVaccineTypes(data || []);
            console.log(data);
        } catch (e) {
            const error = e as AxiosError;
            setError((error?.response?.data as Response)?.message || error.message);
        }
    };

    const navigate = useNavigate();

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
        try {
            await vaccineSchema.validate(vaccineData, { abortEarly: false });
            setValidationErrors({});
            setFirstErrorField(null);
            return true;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errors: { [key: string]: string } = {};
                err.inner.forEach((error) => {
                    if (error.path) {
                        errors[error.path] = error.message;
                    }
                });
                setValidationErrors(errors);
                setFirstErrorField(err.inner[0]?.path || null);
            }
            return false;
        }
    };

    const handleResetButton = async () => {
        setPopupMessage(message["MSG 44"]);
        setPopupVisible(true);
        setComfirmAction(true);
    };

    const handleReset = async () => {
        setPopupVisible(false);

        setVaccineData(prevState => ({
            ...prevState,
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
        }));
        if (imageRef.current) {
            imageRef.current.value = "";
        }
        setPreviewImage("");
        setFileImage(null);

        setValidationErrors({});
        setFirstErrorField(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSubmit) {
            setFirstErrorField(null);
            return;
        }

        const isValid = await validateForm();
        if (!isValid) {
            setIsSubmit(false);
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
            const data = await VaccineService.CreateVaccine(finalVaccineData);
            if (data.message === "This vaccine is existed.") {
                setPopupMessage(message["MSG 56"]);
            }
            else {
                console.log('Vaccine created successfully:', data);
                setPopupMessage(message["MSG 23"]);
                setAdded(true);
            }

            setComfirmAction(false);
            setPopupVisible(true);
        } catch (error) {
            console.error('Error creating vaccine:', error);
        }
    };

    const handleClose = () => {
        setPopupVisible(false);
        setIsSubmit(false);
        if (!hasVaccineType) {
            navigate('/addVaccineType');
        } else {
            if (isSubmit && added) {
                navigate('/vaccine');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <div className="flex justify-center">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-5xl">
                    <h1 className="text-center text-2xl font-bold mb-6">CREATE VACCINE</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-4 gap-4 mb-4 flex items-center">
                            <div className="col-span-3 mr-16">
                                <label className="block mb-2">Vaccine id(<span className="text-red-500">*</span>):</label>
                                <input name="id" value={vaccineData.id} onChange={handleInputChange} type="text" ref={idRef}
                                    className="w-full border border-gray-300 p-2 rounded disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
                                    disabled required />
                                {validationErrors.id && <p className="text-red-500">{validationErrors.id}</p>}
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
                                    className={`w-full border p-2 rounded border-gray-300`}
                                />
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
                                <label className="block mb-2">Number of Injection(<span className="text-red-500">*</span>):</label>
                                <input name="number_Of_Injection" value={vaccineData.number_Of_Injection ?? ''} onChange={handleInputChange}
                                    ref={numberRef} type="text" className="w-full border border-gray-300 p-2 rounded" />
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
                                <input name="time_End_Next_Injection" value={vaccineData.time_End_Next_Injection} onChange={handleInputChange} type="date" className="w-full border border-gray-300 p-2 rounded" />
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
                                    <input
                                        name="purchase_Price"
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
                                onClick={() => setIsSubmit(true)}
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
                                        onClick={handleReset}
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
};

export default AddVaccine;
