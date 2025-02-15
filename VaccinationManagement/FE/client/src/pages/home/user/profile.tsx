import { ChangeEmail } from "@/components/layout/customer/ChangeEmail";
import { ChangePassword } from "@/components/layout/customer/ChangePassword";
import Error from "@/components/layout/modals/error";
import Success from "@/components/layout/modals/success";
import { cn } from "@/helpers/utils";
import CustomerService from "@/services/CustomerService";
import { Customer } from "@/types/user";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Input } from "@material-tailwind/react";
import { CircleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Dropdown, DropdownProps } from "semantic-ui-react";
import * as Yup from 'yup';
import ProfileImg from '../../../assets/images/user_online.png';
import { PHONE_EXP } from "@/helpers/constants/constants";
import { UpdateProfileRequest } from "@/types/customer";
import { useNavigate } from "react-router-dom";

const validationSchema = Yup.object().shape({
    id: Yup.string(),
    username: Yup.string().required("Username is required").trim(),
    full_Name: Yup.string().required("Full name is required").trim(),
    email: Yup.string().email("Invalid email").required("Email is required").trim(),
    address: Yup.string().required("Address is required").trim(),
    date_Of_Birth: Yup.string().required("Date of birth is required"),
    phone: Yup.string()
        .required("Phone number is required")
        .matches(PHONE_EXP, "Phone number is not valid")
        .trim(),
    identity_Card: Yup.string().required("Identity card is required")
        .length(12, "Identity card must be exactly 12 characters")
        .trim(),
    province: Yup.string().required("Province is required"),
    district: Yup.string().required("District is required"),
    ward: Yup.string().required("Ward is required"),
    gender: Yup.number().required("Gender is required"),
    image: Yup.mixed(),
    status: Yup.boolean(),
});

const Profile = () => {
    const [customer, setCustomer] = useState<Customer>();
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [success, setSuccess] = useState<string>("");
    const [error, setErrorMessage] = useState<string>("");
    const [previewImg, setPreviewImg] = useState("");
    const [imageUploaded, setImageUploaded] = useState<File>();
    const fileInputRef = useRef<HTMLInputElement | null>(null);


    const { register, handleSubmit, formState: { errors, submitCount }, setError, getValues, watch, setValue } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            status: true
        }
    });

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const today = getCurrentDate();

    const baseURL = import.meta.env.VITE_BASE_URL;

    const nav = useNavigate();

    const fetchData = (url: string, callback: (data: any[]) => void) => {
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    console.log("Error fetching data");
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

    // Lấy danh sách districts theo provinceCode
    const fetchDistricts = (provinceCode: string) => {
        const url = `${import.meta.env.VITE_APP_ESGOO_DISTRICTS_API!}/${provinceCode}.htm`;
        fetchData(url, setDistricts);
    };

    // Lấy danh sách wards theo districtCode
    const fetchWards = (districtCode: string) => {
        const url = `${import.meta.env.VITE_APP_ESGOO_WARDS_API!}/${districtCode}.htm`;
        fetchData(url, setWards);
    };

    const handleProvinceChange = (_e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {

        setValue("province", data.value?.toString() ?? '', { shouldValidate: submitCount > 0 });
        setValue("district", '', { shouldValidate: submitCount > 0 });
        setValue("ward", '', { shouldValidate: submitCount > 0 });

        setDistricts([]);
        setWards([]);
        fetchDistricts(data.value as string);
    };

    const handleDistrictChange = (_e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {

        setValue("district", data.value?.toString() ?? '', { shouldValidate: submitCount > 0 });
        setValue("ward", '', { shouldValidate: submitCount > 0 });

        setWards([]);
        fetchWards(data.value as string);
    };

    const handleWardChange = (_e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        const wardCode = data.value as string;
        setValue("ward", wardCode, { shouldValidate: true });
    };

    const updateCustomer = async (formData: UpdateProfileRequest) => {
        try {
            //Check existed phone first
            const phone = getValues().phone;
            const data = await CustomerService.CheckPhoneOrEmailExist(undefined, phone, customer?.id!);

            if (data.data) {
                setError("phone", { type: "manual", message: data.message });
                return;
            }

            const username = getValues().username;            
            const usernameData = await CustomerService.CheckUsername(username, customer?.id!, undefined);

            if (usernameData.data) {
                setError("username", { type: "manual", message: usernameData.message });
                return;
            }

            //Upload image if customer selects an image
            let imgPath = "";
            if (imageUploaded) {
                console.log("Uploading image:", imageUploaded);
                const imgResponse = await CustomerService.UploadImage(imageUploaded);
                imgPath = imgResponse.url;
                setValue("image", imgPath);
                formData.image = imgPath;
            }

            await CustomerService.UpdateProfile(formData);
            setErrorMessage("");
            setSuccess("");
            setTimeout(() => {
                setSuccess("Profile updated successfully");
            }, 0); // Slight delay to ensure React processes the state change
        }
        catch (error) {
            setSuccess("");
            setErrorMessage("");
            setTimeout(() => {
                setErrorMessage("Error! Cannot change your profile info");
            }, 0); // Slight delay to ensure React processes the state change
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // Clear existing image states if input is cleared
        // if (!file) {
        //     setPreviewImg("");
        //     setImageUploaded(undefined);
        //     setValue("image", customer?.image);
        //     return;
        // }

        // Check if file is an image
        if (!file!.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
            e.target.value = '';
            setPreviewImg("");
            setImageUploaded(undefined);
            setValue("image", customer?.image);
            return;
        }

        // If validation passes, update all states
        setErrorMessage("");
        setPreviewImg(URL.createObjectURL(file!));
        setImageUploaded(file);
        setValue("image", file);
    };

    const handleCustomButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        const email = localStorage.getItem('email');
        const fetchUser = async () => {
            try {
                if (email) {
                    const user = await CustomerService.GetCustomerByEmail(email);
                    setCustomer(user);

                    if (user.province) {
                        fetchDistricts(user.province);
                    }

                    if (user.district) {
                        fetchWards(user.district);
                    }
                }
            }

            catch (error) {
                console.log(error);
            }
        };
        fetchUser();
        if(!email) nav("/auth");
    }, []);

    useEffect(() => {
        if (customer) {
            setValue("id", customer.id || "");
            setValue("username", customer.username || "");
            setValue("full_Name", customer.full_Name || "");
            setValue("email", customer.email || "");
            setValue("phone", customer.phone || "");
            setValue("date_Of_Birth", customer.date_Of_Birth || "");
            setValue("identity_Card", customer.identity_Card || "");
            setValue("gender", customer.gender || 0);
            setValue("address", customer.address || "");
            setValue("province", customer.province || "");
            setValue("district", customer.district || "");
            setValue("ward", customer.ward || "");
            setValue("image", customer.image || "");
        }
    }, [customer, setValue, watch]);

    useEffect(() => {
        fetchProvinces();
    }, [])

    return (
        <>
            <form onSubmit={handleSubmit(updateCustomer)}>
                <input type="hidden" {...register("id")}></input>
                <input type="hidden" {...register("email")}></input>
                <input type="hidden" {...register("status")}></input>
                <div className="container px-8 mx-auto flex mt-10">
                    <div className="w-1/2">
                        <div className="mb-5">
                            <h1 className="text-2xl">My Profile</h1>
                            <p className="text-lg">Manage and protect your account</p>
                            <hr className="mt-4 border-t-1 border-gray-300"></hr>
                        </div>

                        {/* Change email/password part */}
                        <div className="flex ml-2 mb-3">
                            <ChangeEmail></ChangeEmail>
                            <div className="ml-3">
                                <ChangePassword />
                            </div>
                        </div>

                        <div className="flex font-extrabold">
                            <div className="w-1/2 mx-2">
                                <label htmlFor="username" className="block m-1 text-black">
                                    <span>Username</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    type="text"
                                    id="username"
                                    {...register("username")}
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.username?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />

                                {errors.username && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.username.message}
                                    </span>
                                )}

                            </div>
                            <div className="w-1/2 mx-2">
                                <label htmlFor="name" className="block m-1 text-black">
                                    <span>Full name</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    type="text"
                                    id="name"
                                    {...register("full_Name")}
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.full_Name?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                                {errors.full_Name && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.full_Name.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Email and Phone */}
                        <div className="flex font-extrabold my-5">
                            {/* <div className="w-1/2 mx-2">
                                <label htmlFor="email" className="block m-1 text-black">
                                    <span>Email</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    type="email"
                                    id="email"
                                    className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]"
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    {...register("email")}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                                {errors.email && (
                                    <div className="ui pointing red basic label">{errors.email.message}</div>
                                )}
                            </div> */}
                            <div className="w-1/2 mx-2">
                                <label htmlFor="phone" className="block m-1 text-black">
                                    <span>Phone</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    type="tel"
                                    id="phone"
                                    maxLength={16}
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.phone?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    {...register("phone")}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                                {errors.phone && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.phone.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Date of Birth and Identity Card */}
                        <div className="flex font-extrabold my-5">
                            <div className="w-1/2 mx-2">
                                <label htmlFor="dob" className="block m-1 text-black">
                                    <span>Date of birth</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    type="date"
                                    id="dob"
                                    max={today}
                                    onKeyDown={(e) => e.preventDefault()}
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.date_Of_Birth?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    {...register("date_Of_Birth")}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                                {errors.date_Of_Birth && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.date_Of_Birth.message}
                                    </span>
                                )}
                            </div>
                            <div className="w-1/2 mx-2">
                                <label htmlFor="identityCard" className="block m-1 text-black">
                                    <span>Identity card</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    type="number"
                                    id="identityCard"
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.identity_Card?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    {...register("identity_Card")}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                                {errors.identity_Card && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.identity_Card.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="flex font-extrabold my-5">
                            <div className="w-1/2 mx-2">
                                <label htmlFor="gender" className="block m-1 text-black">
                                    <span>Gender</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>

                                <div className="ml-1 flex justify-start">
                                    <div className="flex items-center me-4">
                                        <input type="radio"
                                            {...register("gender")}
                                            value={1}
                                            checked={watch("gender") == 1}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        ></input>
                                        <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Male
                                        </label>
                                    </div>

                                    <div className="flex items-center me-4">
                                        <input type="radio"
                                            {...register("gender")}
                                            value={0}
                                            checked={watch("gender") == 0}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        ></input>
                                        <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                            Female
                                        </label>
                                    </div>
                                </div>

                                {errors.gender && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.gender.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Location Selection */}
                        <div className="flex mb-4">
                            <div className="w-1/3 mx-2">
                                <label htmlFor="province" className="font-extrabold block m-1 text-black">
                                    <span>Province</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Dropdown
                                    placeholder="Select Province"
                                    search
                                    selection
                                    {...register("province")}
                                    value={watch("province")}
                                    onChange={handleProvinceChange}
                                    options={provinces.map((province) => ({
                                        key: province.id,
                                        value: province.id,
                                        text: province.name,
                                    }))}
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.province?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )}
                                />
                                {errors.province && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.province.message}
                                    </span>
                                )}
                            </div>
                            <div className="w-1/3 mx-2">
                                <label htmlFor="district" className="font-extrabold block m-1 text-black">
                                    <span>District</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Dropdown
                                    placeholder="Select District"
                                    search
                                    selection
                                    value={watch("district")}
                                    {...register("district")}
                                    onChange={handleDistrictChange}
                                    options={districts.map((district) => ({
                                        key: district.id,
                                        value: district.id,
                                        text: district.name
                                    }))}
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.district?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )} />
                                {errors.district && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.district.message}
                                    </span>
                                )}
                            </div>
                            <div className="w-1/3 mx-2">
                                <label htmlFor="ward" className="font-extrabold block m-1 text-black">
                                    <span>Ward</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Dropdown
                                    placeholder="Select Ward"
                                    search
                                    selection
                                    value={watch("ward")}
                                    {...register("ward")}
                                    onChange={handleWardChange}
                                    options={wards.map((ward) => ({
                                        key: ward.id,
                                        value: ward.id,
                                        text: ward.name
                                    }))}
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.ward?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )} />
                                {errors.ward && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.ward.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="w-full font-extrabold">
                            <div className="mx-2">
                                <label htmlFor="address" className="block m-1 text-black">
                                    <span>Address</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    type="text"
                                    id="address"
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        "focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 placeholder:text-gray-500",
                                        Boolean(errors?.address?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500 placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    {...register("address")}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                                {errors.address && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.address.message}
                                    </span>
                                )}
                            </div>
                            <div className="mt-8 flex justify-start mb-10">
                                <Button
                                    type="submit"
                                    color="blue"
                                    className="w-34 h-10"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    Save Changes
                                </Button>

                                <Button
                                    color="orange"
                                    onClick={() => window.history.back()}
                                    className="ml-5 w-34 h-10"
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    <p className="text-white">Cancel</p>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="px-64 w-full">
                        <div className="mt-7">
                            <h1 className="text-2xl">Avatar</h1>
                        </div>
                        <hr className="mt-3"></hr>
                        {/* Images part */}
                        <div className="mt-5">
                            {/* Display preview image */}
                            <div>
                                <img
                                    src={previewImg ? previewImg
                                        : watch("image")
                                            ? `${baseURL}/${watch("image")}`
                                            : `${ProfileImg}`
                                    }
                                    className="w-32 h-32 object-cover rounded-full"
                                />
                            </div>
                            {/* File input */}
                            <div className="mt-4">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                />
                                {/* Custom button */}
                                <div>
                                    <button
                                        onClick={(e) => handleCustomButtonClick(e)}
                                        className="mt-4 w-3/4 px-4 py-2 border-2 border-inherit rounded-none bg-white text-black"
                                    >
                                        Select Image
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            {success && (
                <Success message={success}></Success>
            )}

            {error && (
                <Error message={error}></Error>
            )}
        </>
    );
}

export default Profile;
