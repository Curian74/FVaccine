import { Icons } from "@/components/Icons";
import NewsSidebarComponent from "@/components/layout/news/NewsSidebar";
import { cn } from "@/helpers/utils";
import { Customer } from "@/types/user";
import { Response } from "@/types/response";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Input, Option, Radio, Select } from "@material-tailwind/react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CircleAlert } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import CustomerService from "@/services/CustomerService";
import Loading from "@/components/layout/Loading";
import ScheduleListComponent from "@/components/layout/vaccineResult/ScheduleList";
import { VaccineType } from "@/types/vaccineType";
import VaccineTypeService from "@/services/VaccineTypeService";
import VaccineService from "@/services/VaccineService";
import { Vaccine } from "@/types/vaccine";
import { Schedule } from "@/types/schedule";
import VaccinationResultService from "@/services/VaccinationResultService";
import { VaccinationResult } from "@/types/vaccinationResult";
import FormatId from "@/helpers/constants/FormatID.json"
import AlertWithContent from "@/components/alert/AlertSuccess";
import { VaccinationResultStatus } from "@/types/vaccinationResultStatus";

type RegisterFormsInputs = {
    vaccineTypeId: string;
    vaccineId: string;
    place: string;
    numberInjection: number;
    dateInjection: string;
    nextInjection?: string;
    requiredInjection?: number;
};

interface Location {
    id: string;
    name: string;
    full_name: string;
}
const validation = Yup.object().shape({
    vaccineTypeId: Yup.string()
        .required("Please select Vaccine type"),
    vaccineId: Yup.string().required("Please select Vaccine"),
    dateInjection: Yup.string().required("Date of injection is required"),
    nextInjection: Yup.string()
        .when(['dateInjection', '$numberOfInjections'], {
            is: (dateInjection: string, numberOfInjections: number) => {
                return numberOfInjections > 1 && Boolean(dateInjection);
            },
            then: (schema) => schema.required("Next injection appointment is required"),
            otherwise: (schema) => schema.optional(),
        }),
    place: Yup.string().required("Place of injection is required"),
    numberInjection: Yup.number().required("Number of injection is required"),
});

const TOTAL_VACCINE = 30;


const getTodayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1)
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
};
const today = getTodayDate();

const getNextInjectionDate = (dateInjection: string, dayCount: number) => {
    const date = new Date(dateInjection);
    date.setDate(date.getDate() + dayCount);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

function getLaterDate(startDate?: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    if (!startDate) return tomorrowString;
    const start = new Date(startDate);
    const now = new Date(tomorrowString);

    return start > now ? startDate : tomorrowString;
}



const BookAppointment: React.FC = () => {

    const [searchParam] = useSearchParams();
    const updateId = searchParam.get('updateId');

    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const nav = useNavigate();
    const [customer, setCustomer] = useState<Customer>()
    const [provinceName, setProvinceName] = useState(null);
    const [districtName, setDistrictName] = useState(null);
    const [wardName, setWardName] = useState(null);
    const [resultId, setResultId] = useState("");
    const [vaccineSelected, setVaccinesSelected] = useState<Vaccine>();
    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [schedule, setSchedule] = useState<Schedule>();
    const [loading, setLoading] = useState(false);
    const [lastInjection, setLastInjection] = useState<VaccinationResult>();
    const [updateInjection, setUpdateInjection] = useState<VaccinationResult>();
    const [errorInjection, setErrorInjection] = useState("");
    const [isDisabledUpdate, setIsDisabledUpdate] = useState(true)
    useEffect(() => {
        const fetchUser = async () => {
            const email = localStorage.getItem('email');
            if (email) {
                const user = await CustomerService.GetCustomerByEmail(email);
                setCustomer(user);
            }
        }
        fetchUser();
        fetchVaccineTypes();
    }, [])


    useEffect(() => {
        const fetchVaccineType = async () => {
            try {
                const data = await VaccinationResultService.GetLatestVaccinationResult();
                const id = data.id ? data.id : FormatId.VaccinationResult;
                const prefix = id.slice(0, 2);
                const suffix = id.slice(2);
                const nextSuffix = (parseInt(suffix, 10) + 1).toString();
                const paddedSuffix = nextSuffix.padStart(id.length - 2, '0');

                const nextCode = `${prefix}${paddedSuffix}`;
                setResultId(nextCode);
            } catch (err) {
                console.error(err);
            }
        };
        fetchVaccineType();
    }, []);

    useEffect(() => {
        const fetchName = async () => {
            try {
                if (!customer) {
                    console.error("Customer data is missing");
                    return;
                }

                // Fetch Province
                const responseProvince = await fetch(
                    `https://esgoo.net/api-tinhthanh/1/${customer.province}.htm`
                );
                const dataProvince = await responseProvince.json();

                if (dataProvince?.data) {
                    const province = dataProvince.data.find((p: Location) => p.id === customer.province);
                    if (province) {
                        setProvinceName(province.full_name);
                    } else {
                        console.error("Province not found");
                    }
                } else {
                    console.error("Invalid province data", dataProvince);
                }

                // Fetch District
                const responseDistrict = await fetch(
                    `https://esgoo.net/api-tinhthanh/2/${customer.province}.htm`
                );
                const dataDistrict = await responseDistrict.json();

                if (dataDistrict?.data) {
                    const district = dataDistrict.data.find((d: Location) => d.id === customer.district);
                    if (district) {
                        setDistrictName(district.full_name);
                    } else {
                        console.error("District not found");
                    }
                } else {
                    console.error("Invalid district data", dataDistrict);
                }

                // Fetch Ward
                const responseWard = await fetch(
                    `https://esgoo.net/api-tinhthanh/3/${customer.district}.htm`
                );
                const dataWard = await responseWard.json();

                if (dataWard?.data) {
                    const ward = dataWard.data.find((w: Location) => w.id === customer.ward);
                    if (ward) {
                        setWardName(ward.full_name);
                    } else {
                        console.error("Ward not found");
                    }
                } else {
                    console.error("Invalid ward data", dataWard);
                }
            } catch (error) {
                console.error("Error fetching location data:", error);
            }
        };

        fetchName();
    }, [customer]);
    const {
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormsInputs>({
        mode: "onTouched",
        resolver: yupResolver(validation),
        context: {
            numberOfInjections: schedule?.vaccine?.number_Of_Injection || 0,
            status: lastInjection?.isVaccinated
        }
    });

    const { mutate: handleRegister } = useMutation({
        mutationFn: async (form: RegisterFormsInputs) => {
            const vcType = vaccineTypes.find(vc => vc.id === form.vaccineTypeId)
            const result: VaccinationResult = {
                id: resultId,
                injection_Date: form.dateInjection,
                next_Injection_Date: form?.nextInjection || undefined,
                number_Of_Injection: schedule?.vaccine?.required_Injections,
                prevention: vcType?.vaccine_Type_Name,
                injection_Number: form.numberInjection,
                vaccine_Id: form.vaccineId,
                customer_Id: customer!.id,
                injection_Place_Id: form.place,
                isVaccinated: VaccinationResultStatus.NotInjected,
            }
            await VaccinationResultService.CreateVaccinationResult(result);
        },
        onSuccess: async () => {
            const vaccineName = vaccines.find(v => v.id == watch().vaccineId)?.vaccine_Name
            setSuccess(`Register schedule injection for vaccine ${vaccineName} success`);
            setTimeout(() => {
                nav("/home/schedule");
            }, 3000);
        },
        onError: e => {
            const error = e as AxiosError;
            setError((error?.response?.data as Response)?.message || error.message);
        }
    });

    useEffect(() => {
        if (!loading) {
            const hasChanged =
                watch().place !== updateInjection?.injection_Place_Id ||
                watch().dateInjection !== updateInjection?.injection_Date ||
                watch().nextInjection !== updateInjection?.next_Injection_Date;
            setIsDisabledUpdate(!hasChanged);
        }
    }, [updateInjection, loading, watch()]);


    const handleUpdate = async () => {
        const vcType = vaccineTypes.find(vc => vc.id === watch().vaccineTypeId)
        const updatedResult: VaccinationResult = {
            id: updateId!,
            customer_Id: customer!.id,
            injection_Date: watch().dateInjection,
            next_Injection_Date: watch().nextInjection || undefined,
            number_Of_Injection: watch().requiredInjection,
            injection_Number: updateInjection?.injection_Number,
            prevention: vcType?.vaccine_Type_Name,
            vaccine_Id: updateInjection!.vaccine_Id,
            injection_Place_Id: watch().place,
            isVaccinated: updateInjection!.isVaccinated
        }
        try {
            await VaccinationResultService.UpdateVaccinationResult(updatedResult);
            setSuccess(`Update schedule injection for vaccine ${updateInjection?.vaccine?.vaccine_Name} success`);
            setTimeout(() => {
                nav("/home/schedule");
            }, 3000);
        } catch (e) {
            const error = e as AxiosError;
            setError((error?.response?.data as Response)?.message || error.message);
        }
    }


    useEffect(() => {

        if (updateId) {
            const fetchResultUpdate = async () => {
                setLoading(true);
                try {
                    const result = await VaccinationResultService.GetVaccinationResultById(updateId);
                    setUpdateInjection(result);
                    setValue("vaccineId", result.vaccine_Id, { shouldValidate: true });
                    setValue("dateInjection", result.injection_Date, { shouldValidate: true });
                    setValue("place", result.injection_Place_Id, { shouldValidate: true });
                    setValue("nextInjection", result.next_injection_Date, { shouldValidate: true });
                    setValue("vaccineTypeId", result.prevention, { shouldValidate: true });
                    setValue("numberInjection", result.injection_Number, { shouldValidate: true });
                    setValue("requiredInjection", result.number_Of_Injection, { shouldValidate: true });
                    setSchedule(result.schedule);
                    setLoading(false);
                }
                catch (err) {
                    console.error("Error fetching vaccination result:", err);
                }
            }
            fetchResultUpdate();
        }
    }, [updateId, setValue])

    const fetchVaccineTypes = async () => {
        try {
            const data: VaccineType[] = await VaccineTypeService.GetAllVaccineTypes();
            setVaccineTypes(data);
        } catch (e) {
            const error = e as AxiosError;
            setError((error?.response?.data as Response)?.message || error.message);
        }
    };

    const fetchLastInjection = async (vaccineId: string) => {
        try {
            const lastInjection = await VaccinationResultService.GetLastByCustomerNVaccine(customer!.id, vaccineId);
            setLastInjection(lastInjection);
            const injectionNumber = lastInjection.isVaccinated == VaccinationResultStatus.Injected ? lastInjection.injection_Number! + 1 : lastInjection.injection_Number!;
            setValue("numberInjection", injectionNumber || 1)
            if (lastInjection?.isVaccinated == 1) {
                setErrorInjection("You have already registered for this vaccine.")
            }
            if (lastInjection?.isVaccinated == 2 && lastInjection?.injection_Number == lastInjection?.vaccine?.required_Injections) {
                setErrorInjection("You have already complete for this vaccine.")
            }
        } catch (error) {
            console.error("Error fetching last injection:", error);
            setLastInjection(undefined);
        }
    };

    const handleSelectVaccine = async (value: string) => {
        setErrorInjection("");
        await fetchLastInjection(value);
        setValue("dateInjection", '');
        setValue("nextInjection", '');
        setValue("numberInjection", 1)
        setValue("vaccineId", value, { shouldValidate: true })
        setVaccinesSelected(vaccines.find(v => v.id === value));
    };


    const handleSelectVaccineType = async (value: string) => {
        setValue("vaccineTypeId", value, { shouldValidate: true });
        setVaccines([]);
        setValue("vaccineId", "", { shouldValidate: true });
        if (value) fetchVaccine(value);
    };


    const handleScheduleFromTable = (schedule: Schedule) => {
        const dateInjection = getLaterDate(schedule.start_Date);

        setSchedule(schedule);
        setValue("place", schedule.place!.id, { shouldValidate: true });
        setValue("dateInjection", dateInjection, { shouldValidate: true });
        if (schedule?.vaccine?.required_Injections != 1) {
            setValue("nextInjection", getNextInjectionDate(dateInjection, schedule.vaccine!.time_Between_Injections!), { shouldValidate: true })
        }
    }

    const fetchVaccine = async (value: string) => {
        try {
            const data = await VaccineService.GetVaccineByVaccineTypeId(1, TOTAL_VACCINE, '', value);
            setVaccines(data.vaccines);
        } catch (e) {
            const error = e as AxiosError;
            setError((error?.response?.data as Response)?.message || error.message);
        }
    }

    const isDisabled = lastInjection?.vaccine?.required_Injections == 1 || !watch().dateInjection || updateInjection?.vaccine?.required_Injections == 1;




    if (localStorage.getItem("email") === null) {
        return <Navigate to="/register?from=book-appoinment" />;
    }


    if (loading) return <Loading />

    return (
        <div className="flex mx-12 my-10 gap-x-4">
            <div className="w-3/4 mr-3 my-5 ">
                <div className="flex w-full bg-gray-200 py-5">
                    <div className="mx-2 w-1/12 xl:mx-4 py-1.5 font-medium flex items-center select-none">
                        <Icons.logo className="h-6 w-6" />
                        <span
                            className={cn(
                                "hidden text-xl capitalize font-extrabold md:block bg-gradient-to-b from-blue-500 to-blue-900 text-transparent bg-clip-text"
                            )}
                        >
                            FVC
                        </span>
                    </div>
                    <div className="items-center w-11/12 mt-1.5 ">
                        <span className="text-2xl  font-extrabold text-blue-900"
                        // style={{ fontFamily: "'Arial Black', 'sans-serif'" }}
                        >BOOK AN APPOINTMENT</span>
                    </div>
                </div>
                <div className="my-5">
                    <span>Register vaccination information to save time when checking in at the Reception desk for Customers.
                        Registering vaccination information does not support making exact appointment times.</span>
                    <h1 className="text-xl my-3 font-extrabold text-gray-600">INFORMATION OF CUSTOMER</h1>
                    <span>The fields in this form are based on the information you have registered.
                        If you want to change your personal information, please edit it in your profile.</span>
                </div>
                <form onSubmit={handleSubmit(form => handleRegister(form))}
                    className="space-y-4">
                    <div className="w-full">
                        {/* Full name / Dob */}
                        <div className="flex font-extrabold">
                            <div className="w-1/2 mx-2">

                                <label htmlFor="name" className="block m-1 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> Full name</span>
                                </label>
                                <Input
                                    type="text"
                                    id="name"
                                    className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]"
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled
                                    value={customer?.full_Name}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                            </div>
                            <div className="w-1/2 mx-2">

                                <label htmlFor="dob" className="block m-1 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> Date of birth</span>
                                </label>
                                <Input
                                    type="date"
                                    id="dob"
                                    placeholder=""
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                    )}
                                    value={customer?.date_Of_Birth}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                            </div>
                        </div>

                        {/* Gender / Address */}

                        <div className="flex font-extrabold my-5">
                            <div className="w-1/2 mx-2">

                                <label htmlFor="gender" className="block m-1 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> Gender</span>
                                </label>
                                <div className="rounded-lg shadow-md cursor-not-allowed bg-gray-200">
                                    <div className="flex gap-5 items-center justify-center py-1 px-5">
                                        <div className="rounded-lg hover:bg-gray-200 px-2">
                                            <Radio
                                                name="type"
                                                checked={customer?.gender == 1}
                                                color="orange"
                                                disabled
                                                className="hover:before:opacity-0"
                                                label="Male"
                                                crossOrigin={undefined}
                                                onPointerEnterCapture={() => { }}
                                                onPointerLeaveCapture={() => { }}
                                            />
                                        </div>
                                        <div className="rounded-lg hover:bg-gray-200 px-2 ">
                                            <Radio
                                                name="type"
                                                checked={customer?.gender == 0}
                                                color="orange"
                                                disabled
                                                className="hover:before:opacity-0"
                                                label="Female"
                                                crossOrigin={undefined}
                                                onPointerEnterCapture={() => { }}
                                                onPointerLeaveCapture={() => { }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-1/2 mx-2">

                                <label htmlFor="identityCard" className="block m-1 mb-3 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> Identiy card</span>
                                </label>
                                <Input
                                    type="string"
                                    id="identityCard"
                                    className=
                                    "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]"
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled
                                    value={customer?.identity_Card}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />

                            </div>
                        </div>

                        <div className="flex font-extrabold mb-4">
                            <div className="w-1/3 mx-2">

                                <label htmlFor="province" className="block m-1 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> Province</span>
                                </label>
                                <Input
                                    type="text"
                                    id="province"
                                    className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]"
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled
                                    value={provinceName || ""}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                            </div>
                            <div className="w-1/3 mx-2">

                                <label htmlFor="district" className="block m-1 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> District</span>
                                </label>
                                <Input
                                    type="text"
                                    id="district"
                                    className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]"
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled
                                    value={districtName || ""}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                            </div>
                            <div className="w-1/3 mx-2">

                                <label htmlFor="ward" className="block m-1 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> Ward</span>
                                </label>
                                <Input
                                    type="text"
                                    id="ward"
                                    className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]"
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled
                                    value={wardName || ""}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                            </div>

                        </div>

                        <div className="w-full font-extrabold">
                            <div className="mx-2">
                                <label htmlFor="address" className="block m-1 text-black">
                                    {/* <span className="text-red-800 text-lg">*</span> */}
                                    <span> Address</span>
                                </label>
                                <Input
                                    type="string"
                                    id="address"
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled
                                    value={customer?.address}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="my-5">
                        <h1 className="text-xl my-3 font-extrabold text-gray-600">INFORMATION OF SERVICE</h1>
                    </div>
                    <div className="w-full font-extrabold text-[14px]">

                        {updateId ? (
                            <div className="flex mx-2 gap-x-4 text-[14px]">
                                <div className="w-full xl:w-1/2 mt-1">
                                    <label
                                        htmlFor="vcType"
                                        className="block text-black m-1"
                                    >
                                        <span> Vaccine Type</span>
                                        <span className="text-red-600 text-lg">*</span>
                                    </label>
                                    <Input
                                        id="vcType"
                                        crossOrigin={undefined}
                                        value={watch().vaccineTypeId}
                                        placeholder=''
                                        disabled
                                        onPointerEnterCapture={() => { }}
                                        onPointerLeaveCapture={() => { }}
                                    />
                                </div>
                                <div className="w-full xl:w-1/2 mt-1">
                                    <label
                                        htmlFor="vaccine"
                                        className="block text-black m-1"
                                    >
                                        Vaccine
                                        <span className="text-red-600 text-lg">*</span>
                                    </label>
                                    <Input
                                        id="vcType"
                                        crossOrigin={undefined}
                                        value={watch().vaccineId}
                                        placeholder=''
                                        disabled
                                        onPointerEnterCapture={() => { }}
                                        onPointerLeaveCapture={() => { }}
                                    />

                                </div>

                            </div>
                        ) : (
                            <div className="flex mx-2 gap-x-4 text-[14px]">
                                <div className="w-full xl:w-1/2 mt-1">
                                    <label
                                        htmlFor="vcType"
                                        className="block text-black m-1"
                                    >
                                        <span> Vaccine Type</span>
                                        <span className="text-red-600 text-lg">*</span>
                                    </label>
                                    <Select
                                        id="vcType"
                                        onChange={
                                            (value) => {
                                                handleSelectVaccineType(value || '');
                                            }
                                        }
                                        error={Boolean(errors.vaccineTypeId?.message)}
                                        placeholder=''
                                        onPointerEnterCapture={() => { }}
                                        onPointerLeaveCapture={() => { }}
                                    >
                                        {vaccineTypes.map((vcType) => (
                                            <Option key={vcType.id} value={vcType.id}>
                                                {vcType.vaccine_Type_Name}
                                            </Option>
                                        ))}
                                    </Select>

                                    {errors.vaccineTypeId && (
                                        <span
                                            className={cn(
                                                "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                            )}
                                        >
                                            <CircleAlert className="w-3 h-3" /> {errors.vaccineTypeId.message}
                                        </span>
                                    )}
                                </div>
                                <div className="w-full xl:w-1/2 mt-1">
                                    <label
                                        htmlFor="vaccine"
                                        className="block text-black m-1"
                                    >
                                        Vaccine
                                        <span className="text-red-600 text-lg">*</span>
                                    </label>
                                    <Select
                                        id="vaccine"
                                        onChange={
                                            (value) => {
                                                if (value)
                                                    handleSelectVaccine(value || '');
                                            }
                                        }
                                        error={Boolean(errors.vaccineId?.message || errorInjection)}
                                        placeholder=''
                                        disabled={watch().vaccineTypeId == null}
                                        onPointerEnterCapture={() => { }}
                                        onPointerLeaveCapture={() => { }}
                                    >
                                        {vaccines.map((vaccine) => (
                                            <Option key={vaccine.id} value={vaccine.id}>
                                                {vaccine.vaccine_Name}
                                            </Option>
                                        ))}
                                    </Select>

                                    {(errors.vaccineId || errorInjection) && (
                                        <span
                                            className={cn(
                                                "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                            )}
                                        >
                                            <CircleAlert className="w-3 h-3" /> {errors?.vaccineId?.message ? errors.vaccineId.message : errorInjection}
                                        </span>
                                    )}
                                </div>

                            </div>
                        )}
                        <div className="flex mx-2 gap-x-4 my-4">
                            <div className="w-full xl:w-1/3 mt-1">
                                <label
                                    htmlFor="place"
                                    className="block text-black m-1"
                                >
                                    <span> Center of desired injection</span>
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    id="place"
                                    crossOrigin={undefined}
                                    error={Boolean(errors.place?.message)}
                                    value={schedule?.place?.name || updateInjection?.injection_Place?.name || ""}
                                    placeholder=''
                                    disabled
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />

                                {errors.place && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.place.message}
                                    </span>
                                )}
                            </div>
                            <div className="w-full xl:w-1/3 mt-1">
                                <label
                                    htmlFor="injectionNumber"
                                    className="block text-black m-1"
                                >
                                    Injection number
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    id="injectionNumber"
                                    type="text"
                                    error={Boolean(errors.numberInjection?.message)}
                                    placeholder=''
                                    disabled
                                    value={watch().numberInjection || 1}
                                    crossOrigin={undefined}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />

                                {errors.numberInjection && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.numberInjection.message}
                                    </span>
                                )}
                            </div>
                            <div className="w-full xl:w-1/3 mt-1">
                                <label
                                    htmlFor="requiredDoses"
                                    className="block text-black m-1"
                                >
                                    Required Doses
                                    <span className="text-red-600 text-lg">*</span>
                                </label>
                                <Input
                                    id="requiredDoses"
                                    type="text"
                                    placeholder=''
                                    disabled
                                    // value={watch().requiredInjection}
                                    value={(vaccineSelected?.required_Injections || watch().requiredInjection || 1) < 100 ? vaccineSelected?.required_Injections || watch().requiredInjection : "Yearly"}
                                    crossOrigin={undefined}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                            </div>

                        </div>
                        <div className="flex mx-2 gap-x-4 mb-4">
                            <div className="w-full xl:w-1/2">

                                <label htmlFor="doi" className="block m-1 text-black">
                                    <span> Date of injection</span>
                                    <span className="text-red-800 text-lg">*</span>
                                </label>
                                <Input
                                    type="date"
                                    id="doi"
                                    placeholder=""
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                                        Boolean(errors?.dateInjection?.message) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onChange={(e) => {
                                        const selectedDate = e.target.value;
                                        setValue("dateInjection", selectedDate);
                                        if (vaccineSelected?.required_Injections != 1) {
                                            setValue("nextInjection", getNextInjectionDate(selectedDate, vaccineSelected?.time_Between_Injections || 30), { shouldValidate: true })
                                        }
                                    }}
                                    min={getLaterDate(schedule?.start_Date)}
                                    max={schedule?.end_Date}
                                    // disabled={!schedule}
                                    value={watch().dateInjection || today}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                />
                                {errors.dateInjection && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.dateInjection.message}
                                    </span>
                                )}
                            </div>
                            <div className="w-full xl:w-1/2">

                                <label htmlFor="next" className="block m-1 mb-2 text-black">
                                    <span> Next injection appointment</span>
                                    {!isDisabled &&
                                        <span className="text-red-800 text-lg">*</span>
                                    }
                                </label>
                                <Input
                                    type="date"
                                    id="next"
                                    placeholder=""
                                    className={cn(
                                        "!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100 text-[14px]",
                                        " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                                        Boolean(errors?.nextInjection?.message && !isDisabled) &&
                                        "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                                    )}
                                    labelProps={{ className: "hidden" }}
                                    crossOrigin={undefined}
                                    disabled={isDisabled}
                                    min={getNextInjectionDate(watch().dateInjection || today, vaccineSelected?.time_Between_Injections || 30)}
                                    value={watch().nextInjection || updateInjection?.next_Injection_Date || ""}
                                    onKeyDown={(e) => e.preventDefault()}
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                    {...register("nextInjection")}
                                />
                                {errors.nextInjection && !isDisabled && (
                                    <span
                                        className={cn(
                                            "text-red-500 text-xs mt-1 ml-1 flex gap-x-1 items-center"
                                        )}
                                    >
                                        <CircleAlert className="w-3 h-3" /> {errors.nextInjection.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {(vaccineSelected || watch().vaccineId) &&
                        <ScheduleListComponent
                            vaccineId={vaccineSelected?.id || watch().vaccineId}
                            onTableClick={handleScheduleFromTable}
                        />}
                    {error && (
                        <span className="flex items-center tracking-wide text-xs text-red-500 mt-1 ml-1 gap-x-1">
                            <CircleAlert className="w-3 h-3" /> {error}
                        </span>
                    )}

                    <div className="w-1/5">

                        {updateId ?
                            <Button
                                // type="button"
                                placeholder={""}
                                className="mt-6 text-sm normal-case"
                                onClick={handleUpdate}
                                fullWidth
                                variant="gradient"
                                color="deep-orange"
                                onPointerEnterCapture={() => { }}
                                onPointerLeaveCapture={() => { }}
                                disabled={isDisabledUpdate}
                            >
                                Complete Update
                            </Button>
                            : <Button
                                type="submit"
                                placeholder={""}
                                className="mt-6 text-sm normal-case"
                                fullWidth
                                variant="gradient"
                                color="deep-orange"
                                onPointerEnterCapture={() => { }}
                                onPointerLeaveCapture={() => { }}
                                disabled={success != '' || errorInjection != ""}
                            >
                                Complete Register
                            </Button>
                        }
                    </div>
                </form>


            </div>
            <div className="w-1/4">
                <NewsSidebarComponent />
            </div>
            {success &&
                <div className="w-4/5 fixed left-1/2 transform -translate-x-1/3 bottom-10">
                    <AlertWithContent content={success} />
                </div>
            }
        </div>
    );
};
export default BookAppointment;