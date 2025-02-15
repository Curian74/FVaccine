import CustomerService from "@/services/CustomerService";
import { Customer } from "@/types/user";
import { useState, useEffect, useRef, useCallback } from "react";
import message from '@/helpers/constants/message.json';
import formatid from '@/helpers/constants/FormatID.json';
import { useNavigate } from "react-router-dom";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import { cn } from "@/helpers/utils";
import { MIN_LENGTH_EXP, LOWERCASE_EXP, UPPERCASE_EXP, SPECIAL_CHAR_EXP, NUMERIC_EXP } from "@/helpers/constants/constants";

const CreateCustomer = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isConfirmAction, setComfirmAction] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const baseURL = import.meta.env.VITE_BASE_URL;

    const firstInvalidFieldRef = useRef<HTMLInputElement | null>(null);
    const imageRef = useRef<HTMLInputElement | null>(null);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

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

    const today = getCurrentDate();

    // Initial state for customer form data
    const [customerData, setCustomerData] = useState({
        id: '',
        address: '',
        date_Of_Birth: today,
        full_Name: '',
        email: '',
        gender: 0,
        phone: '',
        identity_Card: '',
        username: '',
        password: '',
        status: true,
        province: '',
        district: '',
        ward: '',
        image: '',
    });

    const [errors, setErrors] = useState({
        full_Name: '',
        date_Of_Birth: '',
        address: '',
        identity_Card: '',
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        captcha: '',
        province: '',
        district: '',
        ward: ''
    });

    const requirements = [
        {
            message: "At least 8 characters",
            isValid: MIN_LENGTH_EXP.test(customerData.password),
        },
        {
            message: "At least one lowercase letter",
            isValid: LOWERCASE_EXP.test(customerData.password),
        },
        {
            message: "At least one uppercase letter",
            isValid: UPPERCASE_EXP.test(customerData.password),
        },
        {
            message: "At least one special character",
            isValid: SPECIAL_CHAR_EXP.test(customerData.password),
        },
        {
            message: "At least one numeric character",
            isValid: NUMERIC_EXP.test(customerData.password),
        },
    ];

    const resetErrors = () => {
        setErrors({
            full_Name: '',
            date_Of_Birth: '',
            address: '',
            identity_Card: '',
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            phone: '',
            captcha: '',
            province: '',
            district: '',
            ward: ''
        });
    }

    // Fetch the new customer ID when the component mounts
    useEffect(() => {
        setLoading(true);
        const fetchNewCustomerId = async () => {
            try {
                const customer = await CustomerService.GetLastCustomer();
                if (customer.id === "Null") customer.id = formatid["Customer"];
                const prefix = formatid["Customer"].slice(0, 2);
                const suffix = customer.id.slice(2);

                const nextSuffix = (parseInt(suffix, 10) + 1).toString();
                const paddedSuffix = nextSuffix.padStart(formatid["Customer"].length - 2, '0');

                const nextId = `${prefix}${paddedSuffix}`;
                console.log(nextId);
                setCustomerData(prevState => ({
                    ...prevState,
                    id: nextId
                }));
            } catch (error) {
                console.error('Error generating new customer ID:', error);
            }
        };

        fetchNewCustomerId();
        setLoading(false);
    }, []);

    const navigate = useNavigate();

    //Handle Province, District and Ward
    const fetchData = (url: string, callback: (data: any[]) => void) => {
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data?.data && Array.isArray(data.data)) {
                    callback(data.data);
                } else {
                    console.error("Invalid data format, API response:", data);
                }
            })
            .catch((error) => console.error(`Error fetching data from ${url}:`, error));
    };

    // Lấy danh sách provinces
    const fetchProvinces = useCallback(() => {
        const url = import.meta.env.VITE_APP_ESGOO_PROVINCES_API!;
        console.log("url: " + url);
        fetchData(url, setProvinces);
    }, []);

    useEffect(() => {
        fetchProvinces();
    }, [fetchProvinces]);

    const handleProvinceChange = (_e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        setCustomerData(prevState => ({
            ...prevState,
            province: data.value as string,
            district: '',
            ward: ''
        }))

        setErrors(prevErrors => ({ ...prevErrors, "province": '' }));
        setDistricts([]);
        setWards([]);
        fetchDistricts(data.value as string);
    };

    // Lấy danh sách districts theo provinceCode
    const fetchDistricts = (provinceCode: string) => {
        const url = `${import.meta.env.VITE_APP_ESGOO_DISTRICTS_API!}/${provinceCode}.htm`;
        fetchData(url, setDistricts);
    };

    const handleDistrictChange = (_e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        setCustomerData(prevState => ({
            ...prevState,
            district: data.value as string,
            ward: '',
        }))

        setErrors(prevErrors => ({ ...prevErrors, "district": '' }));
        setWards([]);
        fetchWards(data.value as string);
    };

    // Lấy danh sách wards theo districtCode
    const fetchWards = (districtCode: string) => {
        const url = `${import.meta.env.VITE_APP_ESGOO_WARDS_API!}/${districtCode}.htm`;
        fetchData(url, setWards);
    };

    //Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        var { name, value } = e.target;
        var l = value.length - 1;
        if (value[l] === ' ' && (l == 0 || value[l - 1] === ' ')) value = value.slice(0, l);
        setCustomerData(prevState => ({
            ...prevState,
            [name]: (name === "phone" || name == "identity_Card") ? value.replace(/[^0-9]/g, "") : value
        }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    const handleConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        var value = e.target.value;
        var l = value.length - 1;
        if (value[l] === ' ' && (l == 0 || value[l - 1] === ' ')) value = value.slice(0, l);
        setConfirmPassword(value);
        setErrors(prevErrors => ({ ...prevErrors, "confirmPassword": '' }));
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

        const response = await fetch(baseURL + "/api/Customer/upload-image", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Failed to upload image");
        }

        const data = await response.json();

        setCustomerData(prev => ({ ...prev, image: data.url, }));

        return data.url;
    };

    const generateCaptcha = () => {
        return Math.random().toString(36).substring(2, 7).toUpperCase();
    };
    const [captcha, setCaptcha] = useState('');
    const [code, setCode] = useState(generateCaptcha());

    //Validate password
    const validatePassword = () => {
        var checkPass = true;
        requirements.forEach(element => {
            if (!element.isValid) {
                console.log(1);
                checkPass = false;
            }
        });
        return checkPass;
    }

    // Validate required fields before submitting
    const validateForm = async () => {
        const newErrors = {
            full_Name: '',
            date_Of_Birth: '',
            address: '',
            identity_Card: '',
            username: '',
            password: '',
            confirmPassword: '',
            email: '',
            phone: '',
            captcha: '',
            province: '',
            district: '',
            ward: ''
        };
        let isValid = true;
        firstInvalidFieldRef.current = null;

        // Check for existing users
        const checkUserExistence = async () => {
            try {
                const existingUser = await CustomerService.CheckUserExistence(
                    customerData.username,
                    customerData.email,
                    customerData.phone,
                );
                if (existingUser.username) {
                    newErrors.username = 'Username already exists';
                    isValid = false;
                    if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='username']");
                }
                if (existingUser.email) {
                    newErrors.email = 'Email already exists';
                    isValid = false;
                    if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='email']");
                }
                if (existingUser.phone) {
                    newErrors.phone = 'Phone number already exists';
                    isValid = false;
                    if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='phone']");
                }
            } catch (error) {
                console.error('Error checking user existence:', error);
            }
        };

        // Call the user existence check
        await checkUserExistence();

        if (!customerData.full_Name) {
            newErrors.full_Name = 'Full name is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='full_Name']");
        }
        if (!customerData.date_Of_Birth) {
            newErrors.date_Of_Birth = 'Date of birth is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='date_Of_Birth']");
        }
        if (!customerData.province) {
            newErrors.province = 'Province is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='province']");
        }
        if (!customerData.district) {
            newErrors.district = 'District is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='district']");
        }
        if (!customerData.ward) {
            newErrors.ward = 'Ward is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='ward']");
        }
        if (!customerData.address) {
            newErrors.address = 'Address is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='address']");
        }
        if (!customerData.identity_Card || customerData.identity_Card.length != 12) {
            newErrors.identity_Card = 'Identity card must be exactly 12 characters';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='identity_Card']");
        }
        if (!customerData.username) {
            newErrors.username = 'Username is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='username']");
        }
        var validPassword = validatePassword();
        if (!validPassword) {
            newErrors.password = 'Incorrect format of password';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='password']");
        }
        if (!customerData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='password']");
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Confirm Password is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='confirmPassword']");
        }
        if (customerData.password && confirmPassword && customerData.password != confirmPassword) {
            newErrors.confirmPassword = 'Confirm Password is not matched';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='confirmPassword']");
        }
        if (!customerData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='email']");
        }
        if (!customerData.phone) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='phone']");
        }
        if (captcha !== code) {
            newErrors.captcha = 'Wrong Captcha';
            isValid = false;
            if (!firstInvalidFieldRef.current) firstInvalidFieldRef.current = document.querySelector("input[name='captcha']");
        }

        setErrors(newErrors);

        if (!isValid && firstInvalidFieldRef.current) {
            firstInvalidFieldRef.current.focus();
            firstInvalidFieldRef.current = null;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isSubmit) return;

        const isValid = await validateForm();
        if (!isValid) {
            setPopupVisible(false);
            setIsSubmit(false);
            return;
        }

        let finalCustomerData = { ...customerData };

        if (fileImage) {
            const upImage = await uploadImage(fileImage);
            if (upImage) {
                finalCustomerData.image = upImage;
            }
        }

        try {
            console.log(customerData);
            const data: Customer = await CustomerService.CreateCustomer(customerData);
            console.log('Customer created successfully:', data);

            setPopupMessage(message["MSG 23"]);
            setSuccess(true);
            setComfirmAction(false);
            setPopupVisible(true);
        } catch (error) {
            setError('Unexpected error creating customer: ' + error);
        }
    };

    const handleResetButton = async () => {
        setPopupMessage(message["MSG 44"]);
        setPopupVisible(true);
        setComfirmAction(true);
    };

    const handleReset = () => {
        setPopupVisible(false);

        setCustomerData(prevState => ({
            ...prevState,
            address: '',
            date_Of_Birth: today,
            full_Name: '',
            email: '',
            gender: 0,
            phone: '',
            identity_Card: '',
            username: '',
            password: '',
            status: true,
            province: '',
            district: '',
            ward: '',
            image: '',
        }))
        if (imageRef.current) {
            imageRef.current.value = "";
        }
        setPreviewImage("");
        setFileImage(null);

        setDistricts([]);
        setWards([]);

        resetErrors();
    }

    const handleClose = () => {
        setPopupVisible(false);
        if (success) {
            navigate('/customer');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        console.log(error);
        return <div>{error}</div>;
    }

    return (
        <>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

            <div className="w-full mx-auto pr-8 mt-10">
                <h1 className="text-center text-2xl font-black mb-5">REGISTER CUSTOMER INFORMATION</h1>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white p-5 rounded shadow-md mb-5">
                        <h2 className="text-lg font-bold mb-3">Personal Information</h2>
                        <hr className="mb-4" />
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1">
                                <label className="font-bold">Full name(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-user mr-2"></i>
                                    <input type="text" name="full_Name" value={customerData.full_Name} onChange={handleInputChange} className="border p-2 w-full mt-1" />

                                </div>
                                {errors.full_Name && <div className="ui pointing red basic label">{errors.full_Name}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="font-bold">Date of birth(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-calendar-alt mr-2"></i>
                                    <input type="date" name="date_Of_Birth" value={customerData.date_Of_Birth} onChange={handleInputChange} className="border p-2 w-full mt-1" />

                                </div>
                                {errors.date_Of_Birth && <div className="ui pointing red basic label">{errors.date_Of_Birth}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="font-bold">Identity card(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-id-card mr-2"></i>
                                    <input type="text" name="identity_Card" value={customerData.identity_Card} onChange={handleInputChange} className="border p-2 w-full mt-1" />
                                </div>
                                {errors.identity_Card && <div className="ui pointing red basic label">{errors.identity_Card}</div>}
                            </div>

                            <div className="col-span-1">
                                <label className="font-bold">Gender(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center mt-2">
                                    <i className="fas fa-venus-mars mr-2"></i>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="0"
                                        checked={customerData.gender === 0}
                                        onChange={(e) => setCustomerData(prevState => ({
                                            ...prevState,
                                            gender: parseInt(e.target.value) // Convert value to number
                                        }))}
                                        className="ml-4 mr-1"
                                    />
                                    Male
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="1"
                                        checked={customerData.gender === 1}
                                        onChange={(e) => setCustomerData(prevState => ({
                                            ...prevState,
                                            gender: parseInt(e.target.value) // Convert value to number
                                        }))}
                                        className="ml-4 mr-1"
                                    />
                                    Female
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block mb-1 font-bold">Province(<span className="text-red-500">*</span>):</label>

                                <div className="flex items-center">
                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                    <Dropdown
                                        placeholder="Select Province"
                                        fluid
                                        search
                                        selection
                                        value={customerData.province}
                                        onChange={handleProvinceChange}
                                        options={provinces.map((province) => ({
                                            key: province.id,
                                            value: province.id,
                                            text: province.name
                                        }))}
                                    />
                                </div>
                                {errors.province && <div className="ui pointing red basic label">{errors.province}</div>}
                            </div>

                            <div className="col-span-1">
                                <label className="block mb-1 font-bold">District(<span className="text-red-500">*</span>):</label>

                                <div className="flex items-center">
                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                    <Dropdown
                                        placeholder="Select District"
                                        fluid
                                        search
                                        selection
                                        value={customerData.district}
                                        onChange={handleDistrictChange}
                                        options={districts.map((district) => ({
                                            key: district.id,
                                            value: district.id,
                                            text: district.name
                                        }))}
                                    />
                                </div>
                                {errors.district && <div className="ui pointing red basic label">{errors.district}</div>}
                            </div>

                            <div className="col-span-1">
                                <label className="block mb-1 font-bold">Ward(<span className="text-red-500">*</span>):</label>

                                <div className="flex items-center">
                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                    <Dropdown
                                        placeholder="Select Ward"
                                        fluid
                                        search
                                        selection
                                        value={customerData.ward}
                                        onChange={(_, data) => {
                                            setCustomerData(prevState => ({
                                                ...prevState,
                                                ward: data.value as string,
                                            }));
                                            setErrors(prevErrors => ({ ...prevErrors, "ward": '' }));
                                        }}
                                        options={wards.map((ward) => ({
                                            key: ward.id,
                                            value: ward.id,
                                            text: ward.name
                                        }))}
                                    />
                                </div>
                                {errors.ward && <div className="ui pointing red basic label">{errors.ward}</div>}
                            </div>

                            <div className="col-span-1">
                                <label className="font-bold">Address(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                    <input type="text" name="address" value={customerData.address} onChange={handleInputChange} className="border p-2 w-full mt-1" />
                                </div>
                                {errors.address && <div className="ui pointing red basic label">{errors.address}</div>}
                            </div>

                            <div className="col-span-2">
                                <label className="block mb-2 font-bold">Image:</label>
                                <div className="flex items-center">
                                    <i className="fas fa-id-card mr-1"></i>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={imageRef}
                                        onChange={handleImageUpload}
                                        className="w-full border border-gray-300 p-1 rounded"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1">
                                {previewImage && (
                                    <div>
                                        <p className='mb-2 font-bold'>Preview:</p>
                                        <img
                                            src={previewImage}
                                            alt="Uploaded Preview"
                                            className="max-w-xs border rounded h-24"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded shadow-md">
                        <h2 className="text-lg font-bold mb-3">Account Information</h2>
                        <hr className="mb-4" />
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="font-bold">Username(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-user mr-2"></i>
                                    <input type="text" name="username" value={customerData.username} onChange={handleInputChange} className="border p-2 w-full mt-1" />
                                </div>
                                {errors.username && <div className="ui pointing red basic label">{errors.username}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="font-bold">Password(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-lock mr-2"></i>
                                    <input type="password" name="password" value={customerData.password} onChange={handleInputChange} className="border p-2 w-full mt-1" />
                                </div>
                                {errors.password && <div className="ui pointing red basic label">{errors.password}</div>}
                                <ul className="mt-4 space-y-1">
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
                            </div>
                            <div className="col-span-1">
                                <label className="font-bold">Confirm Password(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-lock mr-2"></i>
                                    <input type="password" name="confirmPassword" value={confirmPassword} onChange={handleConfirmPassword} className="border p-2 w-full mt-1" />
                                </div>
                                {errors.confirmPassword && <div className="ui pointing red basic label">{errors.confirmPassword}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="font-bold">Email(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-envelope mr-2"></i>
                                    <input type="email" name="email" value={customerData.email} onChange={handleInputChange} className="border p-2 w-full mt-1" />
                                </div>
                                {errors.email && <div className="ui pointing red basic label">{errors.email}</div>}
                            </div>

                            <div className="col-span-1">
                                <label className="font-bold">Phone(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-phone mr-2"></i>
                                    <select
                                        disabled
                                        className="border border-gray-300 p-2 mt-1 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                                    >
                                        <option value="+84">+84 (VN)</option>
                                    </select>

                                    <input type="tel" name="phone" value={customerData.phone} onChange={handleInputChange}
                                        className="border p-2 w-full mt-1" maxLength={10} />
                                </div>
                                {errors.phone && <div className="ui pointing red basic label">{errors.phone}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="block mr-2 mb-2 font-bold">Active(<span className="text-red-500">*</span>):</label>
                                <i className="fas fa-vial mr-2"></i>
                                <input type="checkbox" name="status" checked={customerData.status} onChange={() => setCustomerData(prevState => ({ ...prevState, status: !prevState.status }))} className="form-checkbox" />
                            </div>
                            <div className="col-span-1">
                                <label className="font-bold">Captcha(<span className="text-red-500">*</span>):</label>
                                <div className="flex items-center">
                                    <i className="fas fa-lock mr-2"></i>
                                    <input type="text" name="captcha" value={captcha}
                                        onChange={(e) => {
                                            setCaptcha(e.target.value);
                                            setErrors(prevErrors => ({ ...prevErrors, "captcha": '' }));
                                        }}
                                        className="border p-2 w-full mt-1" />
                                </div>
                                {errors.captcha && <div className="ui pointing red basic label">{errors.captcha}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="font-bold">Code:</label>
                                <div className="flex items-center">
                                    <i className="fas fa-key mr-2"></i>
                                    <input type="text" value={code} className="border p-2 w-20 mt-1" readOnly />
                                    <i className="fas fa-sync-alt ml-2" onClick={() => setCode(generateCaptcha())}></i>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start mt-5">
                            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                onClick={() => setIsSubmit(true)}
                            >Save</button>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                onClick={handleResetButton}
                            >Reset</button>
                            <button className="bg-orange-500 text-white px-4 py-2 rounded" onClick={() => navigate('/customer')}>Cancel</button>
                        </div>
                    </div>
                </form>

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
            </div>
        </>
    );
};

export default CreateCustomer;
