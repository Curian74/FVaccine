import { Icons } from "@/components/Icons";
import { cn } from "@/helpers/utils";
import { yupResolver } from "@hookform/resolvers/yup";
import Success from "@/assets/images/check.png";
import { Input, Option, Radio, Select, Step, Stepper } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, CircleAlert } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { LOWERCASE_EXP, MIN_LENGTH_EXP, NUMERIC_EXP, PHONE_EXP, SPECIAL_CHAR_EXP, UPPERCASE_EXP } from "@/helpers/constants/constants";
import CustomerService from "@/services/CustomerService";
import formatid from '@/helpers/constants/FormatID.json';
import AuthService from "@/services/AuthService";


interface RegisterFormInputs {
  fullName: string;
  dob: string;
  gender: number;
  identityCard: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
  email: string;
}

const validation = Yup.object().shape({
  fullName: Yup.string()
    .required("Full name is required")
    .max(30, "Full name must no more than 30 characters"),
  username: Yup.string()
    .trim()
    .required("username is required")
    .max(20, "username must no more than 20 characters"),
  gender: Yup.number().required("Gender is required"),
  phone: Yup.string().required("Phone is required").matches(PHONE_EXP, "Phone number is not valid"),
  dob: Yup.string().required(),
  identityCard: Yup.string().required("Identity card is required")
    .length(12, "Identity card must be exactly 12 characters"),
  province: Yup.string().required(),
  district: Yup.string().required(),
  ward: Yup.string().required(),
  address: Yup.string().trim().required(),
  password: Yup.string().required("Password is required")
    .matches(MIN_LENGTH_EXP, "Password must be at least 8 characters")
    .matches(LOWERCASE_EXP, "Password must contain at least one lowercase letter")
    .matches(UPPERCASE_EXP, "Password must contain at least one uppercase letter")
    .matches(SPECIAL_CHAR_EXP, "Password must contain at least one special character")
    .matches(NUMERIC_EXP, "Password must contain at least one digit"),
  confirmPassword: Yup.string().required().oneOf([Yup.ref("password")], "Passwords must match"),
  email: Yup.string().email("Invalid email").required(),
});

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    watch,
    setError,
    formState: { errors }
  } = useForm<RegisterFormInputs>({
    mode: "onTouched",
    resolver: yupResolver(validation),
  });
  const [activeStep, setActiveStep] = React.useState(0);
  const [preStep, setPreStep] = React.useState(-1);
  const [isLastStep, setIsLastStep] = React.useState(false);
  const [isFirstStep, setIsFirstStep] = React.useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [customerId, setCustomerId] = useState('');

  const [searchParams] = useSearchParams();

  const from = searchParams.get('from');

  const nav = useNavigate();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getCurrentDate();

  // useEffect(() => {
  //   // Fetch Provinces
  //   fetch("https://esgoo.net/api-tinhthanh/1/0.htm")
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log(data); // Log API response to verify
  //       if (data?.data && Array.isArray(data.data)) {
  //         setProvinces(data.data); // Set the provinces state
  //       } else {
  //         console.error("Invalid provinces data format:", data);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching provinces:", error);
  //     });
  // }, []);



  const handleProvinceChange = (value: string) => {
    setValue("province", value, { shouldValidate: true });
    if (watch("district")) {
      setValue("district", '', { shouldValidate: true });
    }
    if (watch("ward")) {
      setValue("ward", '', { shouldValidate: true });
    }
    setDistricts([]);
    setWards([]);

    console.log("province: " + getValues().province);
    if (value) {
      fetchDistricts(value);
    }
  };


  const handleDistrictChange = (value: string) => {
    setValue("district", value, { shouldValidate: true });
    if (watch("ward")) {
      setValue("ward", '', { shouldValidate: true });
    }
    setWards([]);
    console.log(value);
    if (value) {
      fetchWards(value);
    }
  };

  const handleWardChange = (value: string) => {
    setValue("ward", value, { shouldValidate: true });
    console.log(value);
  };

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



  // const fetchWards = (districtCode: string) => {
  //   fetch(`https://vn-public-apis.fpo.vn/wards/getByDistrict?districtCode=${districtCode}&limit=-1`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data?.data?.data && Array.isArray(data.data.data)) {
  //         setWards(data.data.data);
  //       } else {
  //         console.error("No wards data found, API response:", data);
  //       }
  //     })
  //     .catch((error) => console.error('Error fetching wards:', error));
  // };

  const nextStep = () => {
    if (!isLastStep) {
      setPreStep(activeStep);
      setActiveStep(cur => cur + 1);
    }
  };
  // const prevStep = () => {
  //   if (!isFirstStep) {
  //     setPreStep(activeStep);
  //     setActiveStep(cur => cur - 1);
  //   }
  // };

  const handleNext = async () => {
    let isValid = false;
    switch (activeStep) {
      case 0:
        isValid = await trigger([
          "fullName", "address", "gender", "phone",
          "province", "district", "ward", "identityCard"
        ]);
        if (isValid) {
          const isPhoneUnique = await checkPhone();
          if (!isPhoneUnique) return;
        }
        break;
      case 1:
        isValid = await trigger([
          "username", "email", "password", "confirmPassword",
        ]);
        if (isValid) {
          const isEmailUnique = await checkEmail();
          if (!isEmailUnique) return;
        }
        break;
      default:
        isValid = true;
        break;
    }
    if (isValid) {
      nextStep();
    }
  };

  const checkPhone = async () => {
    const phone = getValues().phone;
    const data = await CustomerService.CheckPhoneOrEmailExist(undefined, phone);
    console.log("data: " + data.data + "message: " + data.message);

    if (data.data) {
      setError("phone", { type: "manual", message: data.message });
      return false;
    }
    return true;
  }

  const checkEmail = async () => {
    const email = getValues().email;
    const data = await CustomerService.CheckPhoneOrEmailExist(email, undefined);
    if (data.data) {
      setError("email", { type: "manual", message: data.message });
      return false;
    }
    return true;
  }

  const password = watch("password", "");

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
        setCustomerId(nextId)
      } catch (error) {
        console.error('Error generating new customer ID:', error);
      }
    };

    fetchNewCustomerId();
    setLoading(false);
  }, []);

  const handleCreateProfile = async (form: RegisterFormInputs) => {
    try {
      setLoading(true);
      const payload = {
        id: customerId,
        address: form.address,
        date_Of_Birth: form.dob,
        full_Name: form.fullName,
        email: form.email,
        gender: form.gender,
        phone: form.phone,
        identity_Card: form.identityCard,
        username: form.username,
        password: form.password,
        status: true,
        province: form.province,
        district: form.district,
        ward: form.ward,
        image: '',
      };
      await CustomerService.CreateCustomer(payload);
      handleLogin(form.email, form.password);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {

      await AuthService.login(email, password)
      if (from) {
        navigate("/home/book-appointment");
      }
      navigate("/home");
      console.log("login successful");
    } catch {
      console.error('Login failed');
      navigate("/auth");
    }
    // dispatch(signIn({ user }));
  }

  const renderStep = (step: number) => {
    return (
      <>
        <div className={cn(step != 0 && "hidden")}>
          <div className="mb-6">
            <p className="text-md font-semibold">Basic Info</p>
            <p className="text-sm text-gray-600 text-left">
              Tell us a bit about yourself to get started on our services
            </p>
          </div>

          <div className="flex xl:justify-between xl:flex-row flex-col gap-y-4 xl:gap-x-4">
            <div className="w-full xl:w-1/3">
              <label
                htmlFor="fullName"
                className="block text-black font-bold text-sm m-1"
              >
                Full Name
              </label>
              <Input
                id="fullName"
                type=""
                placeholder="ex: Vu Quang Truong"
                className={cn(
                  "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                  " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500 !min-w-[100px]",
                  Boolean(errors.fullName?.message) &&
                  "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                )}
                containerProps={{ className: "min-w-full" }}
                labelProps={{ className: "hidden" }}
                crossOrigin={undefined}
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                {...register("fullName")}
              />
              {errors.fullName && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.fullName.message}
                </span>
              )}
            </div>

            <div className="w-full xl:w-1/3">
              <label
                htmlFor="dob"
                className="block text-black font-bold text-sm m-1"
              >
                Date of birth
              </label>
              <Input
                id="dob"
                type="date"
                defaultValue={today}
                onKeyDown={(e) => e.preventDefault()}
                max={today}
                className={cn(
                  "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                  " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                  Boolean(errors.dob?.message) &&
                  "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                )}
                containerProps={{ className: "min-w-full" }}
                labelProps={{ className: "hidden" }}
                crossOrigin={undefined}
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                {...register("dob")}
              />
              {errors.dob && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.dob.message}
                </span>
              )}
            </div>
            <div className="w-full xl:w-1/3">
              <label
                htmlFor="identity"
                className="block text-black font-bold text-sm m-1"
              >
                Identity card
              </label>
              <Input
                id="identity"
                type="number"
                placeholder="ex: 001203031404"
                className={cn(
                  "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                  " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500 !min-w-[100px]",
                  Boolean(errors.identityCard?.message) &&
                  "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                )}
                containerProps={{ className: "min-w-full" }}
                labelProps={{ className: "hidden" }}
                crossOrigin={undefined}
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                {...register("identityCard")}
              />
              {errors.identityCard && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.identityCard.message}
                </span>
              )}
            </div>
          </div>

          <div className="w-full mt-6 gap-x-2">
            <label className="block text-black font-bold text-sm m-1">Gender</label>
            <div className="flex gap-x-4">
              <Radio
                color="orange"
                label={<p className="text-sm">Male</p>}
                defaultChecked
                crossOrigin={undefined}
                className="w-4 h-4"
                value={1}
                placeholder=''
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                {...register("gender")}
              />
              <Radio
                color="orange"
                label={<p className="text-sm">Female</p>}
                crossOrigin={undefined}
                className="w-4 h-4"
                value={0}
                placeholder=''
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                {...register("gender")}
              />
            </div>
          </div>
          <div className="flex xl:justify-between xl:flex-row flex-col gap-y-4 xl:gap-x-4">
            <div className="w-full xl:w-1/3">
              <label
                htmlFor="province"
                className="block text-black font-bold text-sm m-1"
              >
                Province
              </label>
              <Select
                id="province"
                onChange={(value) => {
                  handleProvinceChange(value || '');
                }}
                error={Boolean(errors.province?.message)}
                placeholder=''
                // value={getValues("province")}
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
              >
                {provinces.map((province) => (
                  <Option key={province.id} value={province.id}>
                    {province.name}
                  </Option>
                ))}
              </Select>

              {errors.province && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.province.message}
                </span>
              )}
            </div>

            <div className="w-full xl:w-1/3">
              <label
                htmlFor="district"
                className="block text-black font-bold text-sm m-1"
              >
                District
              </label>
              <Select
                id="district"
                onChange={(value) => {
                  handleDistrictChange(value || '');
                }}
                error={Boolean(errors.district?.message)}
                disabled={watch("province") == null}
                placeholder=''
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
              >
                {districts.map((district) => (
                  <Option key={district.id} value={district.id}>
                    {district.name}
                  </Option>
                ))}
              </Select>

              {errors.district && watch().province && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.district.message}
                </span>
              )}
            </div>
            <div className="w-full xl:w-1/3">
              <label
                htmlFor="ward"
                className="block text-black font-bold text-sm m-1"
              >
                Ward
              </label>
              <Select
                id="ward"
                onChange={(value) => {
                  if (value) {
                    handleWardChange(value);
                  }
                }}
                error={Boolean(errors.ward?.message)}
                disabled={watch("district") == null}
                placeholder=''
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
              >
                {wards.map((ward) => (
                  <Option key={ward.id} value={ward.id}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
              {errors.ward && watch().district && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.ward.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex xl:justify-between xl:flex-row flex-col gap-y-4 xl:gap-x-4 mt-5">
            <div className="w-full xl:w-1/2">
              <label
                htmlFor="address"
                className="block text-black font-bold text-sm m-1"
              >
                Address
              </label>
              <Input
                id="address"
                type="text"
                placeholder="ex: Bang qua Cau Giay"
                className={cn(
                  "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                  " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                  Boolean(errors.address?.message) &&
                  "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                )}
                containerProps={{ className: "min-w-full" }}
                labelProps={{ className: "hidden" }}
                crossOrigin={undefined}
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                {...register("address")}
              />
              {errors.address && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.address.message}
                </span>
              )}
            </div>
            <div className="w-full xl:w-1/2">
              <label htmlFor="phone" className="block text-black font-bold text-sm m-1">
                Phone
              </label>
              <Input
                id="phone"
                type="text"
                maxLength={16}
                placeholder="ex: 0123456789"
                className={cn(
                  "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                  " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                  Boolean(errors.phone?.message) &&
                  "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                )}
                labelProps={{ className: "hidden" }}
                crossOrigin={undefined}
                onPointerEnterCapture={() => { }}
                onPointerLeaveCapture={() => { }}
                {...register("phone")}
              />
              {errors.phone && (
                <span
                  className={cn(
                    "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                  )}
                >
                  <CircleAlert className="w-3 h-3" /> {errors.phone.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={cn(step != 1 && "hidden", "max-h-full")}>
          <div className="mb-6">
            <p className="text-md font-semibold">Register your account information</p>
            <p className="text-sm text-gray-600 text-left my-3">
              Just one last step, complete the information using to log in
            </p>
            <div className="flex xl:justify-between xl:flex-row flex-col gap-y-4 xl:gap-x-4">
              <div className="w-full xl:w-1/2">
                <label
                  htmlFor="username"
                  className="block text-black font-bold text-sm m-1"
                >
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="ex: Truong"
                  className={cn(
                    "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                    " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500 !min-w-[100px]",
                    Boolean(errors.username?.message) &&
                    "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                  )}
                  containerProps={{ className: "min-w-full" }}
                  labelProps={{ className: "hidden" }}
                  crossOrigin={undefined}
                  onPointerEnterCapture={() => { }}
                  onPointerLeaveCapture={() => { }}
                  {...register("username")}
                />
                {errors.username && (
                  <span
                    className={cn(
                      "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                    )}
                  >
                    <CircleAlert className="w-3 h-3" /> {errors.username.message}
                  </span>
                )}
              </div>

              <div className="w-full xl:w-1/2">
                <label
                  htmlFor="email"
                  className="block text-black font-bold text-sm m-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  className={cn(
                    "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                    " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                    Boolean(errors.email?.message) &&
                    "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                  )}
                  containerProps={{ className: "min-w-full" }}
                  labelProps={{ className: "hidden" }}
                  crossOrigin={undefined}
                  onPointerEnterCapture={() => { }}
                  onPointerLeaveCapture={() => { }}
                  {...register("email")}
                />
                {errors.email && (
                  <span
                    className={cn(
                      "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                    )}
                  >
                    <CircleAlert className="w-3 h-3" /> {errors.email.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex xl:justify-between xl:flex-row flex-col gap-y-4 xl:gap-x-4  mt-6">
              <div className="w-full xl:w-1/2">
                <label
                  htmlFor="password"
                  className="block text-black font-bold text-sm m-1"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="***********"
                  className={cn(
                    "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                    " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                    Boolean(errors.password?.message) &&
                    "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                  )}
                  containerProps={{ className: "min-w-full" }}
                  labelProps={{ className: "hidden" }}
                  crossOrigin={undefined}
                  onPointerEnterCapture={() => { }}
                  onPointerLeaveCapture={() => { }}
                  {...register("password")}
                />
                <ul className="mt-2 space-y-1">
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
              <div className="w-full xl:w-1/2">
                <label htmlFor="rePassword" className="block text-black font-bold text-sm m-1">
                  Confirm Password
                </label>
                <Input
                  id="rePassword"
                  type="password"
                  placeholder="***********"
                  className={cn(
                    "!border !border-gray-300 bg-white text-gray-900 shadow-xl shadow-gray-900/5 ring-4 ring-transparent placeholder:opacity-100",
                    " focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10  placeholder:text-gray-500",
                    Boolean(errors.confirmPassword?.message) &&
                    "focus:!border-red-600 focus:!border-t-red-600 focus:ring-red-600/10 !border-red-500  placeholder:text-red-500"
                  )}
                  labelProps={{ className: "hidden" }}
                  crossOrigin={undefined}
                  onPointerEnterCapture={() => { }}
                  onPointerLeaveCapture={() => { }}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <span
                    className={cn(
                      "text-red-500 text-[14px] mt-1 ml-1 flex gap-x-1 items-center"
                    )}
                  >
                    <CircleAlert className="w-3 h-3" /> {errors.confirmPassword.message}
                  </span>
                )}
              </div>

            </div>
          </div>
        </div>
        <div className={cn(step != 2 && "hidden")}>
          <div className="mt-8 gap-y-2 flex flex-col items-center justify-center">
            <img className="w-16 h-16" src={Success} />
            <p className="text-sm text-blue-gray-800">
              Get ready to explore a new world!
            </p>
          </div>
        </div>
      </>
    );
  };
  return (
    <form
      className="flex flex-col justify-center items-center h-screen overflow-hidden"
      onSubmit={handleSubmit(handleCreateProfile)}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="w-full max-w-screen-lg h-full flex flex-col my-8 px-2"
      >
        <div className="flex">
          <div className="rounded-full absolute cursor-pointer mt-5 bg-gray-200 hover:bg-gray-300 h-10 w-10 flex"
            onClick={() => nav("/home")}
          >
            <ArrowLeft className="m-auto" />
          </div>
          <div className="mx-auto text-center mb-4">
            <Icons.logo className="w-10 h-10 mx-auto" />
            <span className="font-semibold text-lg">Welcome to FVaccine</span>
          </div>
        </div>
        <Stepper
          activeStep={activeStep}
          isLastStep={value => setIsLastStep(value)}
          isFirstStep={value => setIsFirstStep(value)}
          lineClassName="bg-orange-200"
          activeLineClassName="bg-deep-orange-400"
          className="mb-4"
          placeholder=''
          onPointerEnterCapture={() => { }}
          onPointerLeaveCapture={() => { }}
        >
          <Step
            className="!bg-orange-300 !text-white w-6 h-6"
            activeClassName="!bg-deep-orange-400"
            completedClassName="!bg-deep-orange-400"
            placeholder=''
            onPointerEnterCapture={() => { }}
            onPointerLeaveCapture={() => { }}
          >
            {activeStep > 0 ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : (
              <span className="text-xs">1</span>
            )}
          </Step>
          <Step
            className="!bg-orange-300 !text-white w-6 h-6"
            activeClassName="!bg-deep-orange-400"
            completedClassName="!bg-deep-orange-400"
            placeholder=''
            onPointerEnterCapture={() => { }}
            onPointerLeaveCapture={() => { }}
          >
            {activeStep > 1 ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : (
              <span className="text-xs">2</span>
            )}
          </Step>
          <Step
            className="!bg-orange-300 !text-white w-6 h-6"
            activeClassName="!bg-deep-orange-400"
            completedClassName="!bg-deep-orange-400"
            placeholder=''
            onPointerEnterCapture={() => { }}
            onPointerLeaveCapture={() => { }}
          >
            {activeStep > 2 ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : (
              <span className="text-xs">3</span>
            )}
          </Step>
        </Stepper>

        <motion.div
          key={activeStep}
          initial={{ x: preStep < activeStep ? -2 : 2, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        >
          {renderStep(activeStep)}
        </motion.div>

        <div className="flex justify-end gap-x-2 mt-auto text-xs font-semibold w-full">
          {/* <button
            type="button"
            onClick={() => {
              if (!loading) prevStep();
            }}
            className={cn(
              "bg-deep-orange-400 text-white rounded-sm px-4 py-2",
              isFirstStep && "bg-deep-orange-200"
            )}
          >
            Back
          </button> */}
          <button
            type={isLastStep ? "submit" : "button"}
            onClick={async () => {
              if (!loading && !isLastStep) {
                await handleNext();
              }
            }}

            className={cn("bg-deep-orange-400 rounded-sm text-white px-4 py-2")}
          >
            {!isLastStep ? "Next" : "Finish"}
          </button>
        </div>
      </motion.div>
    </form>
  );
};

export default Register;
