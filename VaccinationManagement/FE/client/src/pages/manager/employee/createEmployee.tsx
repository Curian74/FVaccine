import { SyntheticEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Position } from "@/types/position";
import PositionService from "@/services/PositionService";
import message from "@/helpers/constants/message.json";
import formatId from "@/helpers/constants/FormatID.json";
import PositionModal from "./components/PositionModal";
import { Button, Dropdown, DropdownProps, GridColumn, GridRow } from "semantic-ui-react";
import { useForm } from "react-hook-form";
import * as Yup from 'yup';
import { Employee } from "@/types/employee";
import { yupResolver } from "@hookform/resolvers/yup";
import EmployeeService from "@/services/EmployeeService";
import { dropdownEntry } from "../schedule/utils/scheduleUtils";
import { Place } from "@/types/place";
import PlaceModal from '@/components/layout/place/PlaceModal';
import PlaceService from "@/services/PlaceService";
import { cn, PaginatedList } from "@/helpers/utils";
import { LOWERCASE_EXP, MIN_LENGTH_EXP, NUMERIC_EXP, SPECIAL_CHAR_EXP, UPPERCASE_EXP } from "@/helpers/constants/constants";

const CreateEmployee = () => {

  const [activePositions, setActivePositions] = useState<Position[]>([]);
  const [previewImg, setpreviewImg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [placeDropdown, setPlaceDropdown] = useState<dropdownEntry[]>([]);
  const [placeDropdownLoading, setPlaceDropdownLoading] = useState(false)
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>();
  const edited = useRef(false);
  const placeDropdownEntries = useRef<Place[]>([]);
  const placeError = useRef<string | undefined>(undefined);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeFormDisplay, setPlaceFormDisplay] = useState(false);
  const [modalState, setModalState] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const placeDropDownPageIndex = useRef(0);

  const [employeeId, setEmployeeId] = useState("");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [employee, setEmployee] = useState({
    id: "",
    username: "",
    employee_Name: "",
    date_Of_Birth: "",
    phone: "",
    password: "",
    email: "",
    wardId: "",
    districtId: "",
    provinceId: "",
    address: "",
    place_Id: "",
    PositionId: "0",
    gender: undefined,
    image: null as File | null,
    role_Id: false,
    status: false,
  });

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required").trim(),
    employee_Name: Yup.string().required("Employee name is required").trim(),
    date_Of_Birth: Yup.string()
      .required("Date of birth is required")
      .test("is-18", message["MSG 33"], function (value) {
        if (!value) return false;
        const age = EmployeeService.calculateAge(value.toString());
        return age >= 18;
      }),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, message["MSG 54"])
      .min(9, message["MSG 41"])
      .max(10, message["MSG 41"])
      .trim(),
    password: Yup.string().required("Password is required")
      .matches(MIN_LENGTH_EXP, "Password must be at least 8 characters")
      .matches(LOWERCASE_EXP, "Password must contain at least one lowercase letter")
      .matches(UPPERCASE_EXP, "Password must contain at least one uppercase letter")
      .matches(SPECIAL_CHAR_EXP, "Password must contain at least one special character")
      .matches(NUMERIC_EXP, "Password must contain at least one digit"),
    confirmPassword: Yup.string().required("Confirm password is required")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    email: Yup.string().email("Invalid email").required("Email is required").trim(),
    address: Yup.string().required("Address is required").trim(),
    provinceId: Yup.string().required("Province is required"),
    districtId: Yup.string().required("District is required"),
    wardId: Yup.string().required("Ward is required"),
    place_Id: Yup.string().required("Working place is required"),
    PositionId: Yup.string().required("Position is required"),
    gender: Yup.number().required("Gender is required"),
    role_Id: Yup.number(),
    status: Yup.boolean(),
    image: Yup.mixed(),
  });

  const { register, handleSubmit, formState: { errors, submitCount }, watch, setValue, reset, getValues } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      username: "",
      employee_Name: "",
      date_Of_Birth: getCurrentDate(),
      phone: "",
      password: "",
      email: "",
      wardId: "",
      districtId: "",
      provinceId: "",
      address: "",
      place_Id: "",
      PositionId: "",
      gender: undefined,
      role_Id: 2,
      status: true,
      image: null,
      confirmPassword: ''
    },
  });

  const navigate = useNavigate();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const entriesPerFetch = 10;

  const handleSelectPlace = (_: SyntheticEvent, dropDownProps: { value?: string | number | boolean | (string | number | boolean)[] | undefined }) => {
    edited.current = true;
    setSelectedPlaceName(placeDropdownEntries.current.find(place => place.id === dropDownProps.value?.toString())?.name);
    setEmployee({ ...employee, place_Id: dropDownProps.value?.toString() ?? '' });
    setValue("place_Id", dropDownProps.value?.toString() ?? '', {
      shouldValidate: true
    });
  };

  const handlePositionSelect = (_: SyntheticEvent, dropDownProps: { value?: string | number | boolean | (string | number | boolean)[] | undefined }) => {
    setEmployee({ ...employee, PositionId: String(dropDownProps.value) });
    setValue("PositionId", dropDownProps.value?.toString() ?? '', {
      shouldValidate: true
    });
  };

  const fetchProvinces = async () => {
    const url = import.meta.env.VITE_APP_ESGOO_PROVINCES_API!
    try {
      const response = await fetch(url);
      const data = await response.json();
      setProvinces(data.data);
    }

    catch (error) {
      console.log(error);
    }
  }

  const fetchDistricts = async (provinceCode: string) => {
    const url = import.meta.env.VITE_APP_ESGOO_DISTRICTS_API! + `/${provinceCode}.htm`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setDistricts(data.data);
    }
    catch (error) {
      console.log(error);
    }
  }

  const fetchWards = async (districtCode: string) => {
    const url = `${import.meta.env.VITE_APP_ESGOO_WARDS_API!}/${districtCode}.htm`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setWards(data.data);
    }

    catch (error) {
      console.log(error);
    }
  }

  const handleProvinceChange = (_e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    setEmployee((prevState) => ({
      ...prevState,
      provinceId: data.value as string,
      districtId: '',
      wardId: '',
    }));

    setValue("provinceId", data.value?.toString() ?? '', {
      shouldValidate: submitCount > 0
    });
    setValue("districtId", '', {
      shouldValidate: submitCount > 0
    });
    setValue("wardId", '', {
      shouldValidate: submitCount > 0
    });

    setDistricts([]);
    setWards([]);
    fetchDistricts(data.value as string);
  };

  const handleDistrictChange = (_e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    setEmployee((prevState) => ({
      ...prevState,
      districtId: data.value as string,
      wardId: '',
    }));

    setValue("districtId", data.value?.toString() ?? '', {
      shouldValidate: submitCount > 0
    });
    setValue("wardId", '', {
      shouldValidate: submitCount > 0
    });

    setWards([]);
    fetchWards(data.value as string);
  };


  const fetchActivePositons = async () => {
    try {
      const response: Position[] = await PositionService.GetActivePositions();
      console.log(response);
      setActivePositions(response || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  // Fetch the next employee ID
  const fetchNextId = async () => {
    try {
      const response = await axios.get(`${baseUrl}/Employees/next-id`);

      const prefix = formatId["Employee"].slice(0, 2);
      const currentId = response.data;
      const suffix = currentId.slice(2);
      const nextNumber = parseInt(suffix, 10);
      const paddedSuffix = nextNumber.toString().padStart(6, '0');

      const nextId = `${prefix}${paddedSuffix}`;

      setEmployeeId(nextId);
    } catch (error) {
      console.error("Error fetching next employee ID:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];

    if (!file!.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
      e.target.value = '';
      return;
    }

    if (file) {
      const previewURL = URL.createObjectURL(file);
      setpreviewImg(previewURL);
    }
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (key === "image" && data.image[0] instanceof File) {
        formData.append(key, data.image[0]);
      } else {
        formData.append(key, data[key as keyof Employee]?.toString() || "");
      }
    });

    try {
      const response = await axios.post(`${baseUrl}/Employees`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 || response.status === 201) {
        setModalMessage(message["MSG 23"]);
        setModalTitle("Success");
        setModalState("success")
        setIsModalOpen(true);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create employee. Please try again!";
      setModalMessage(errorMessage);
      setModalTitle("Error");
      setModalState("Error");
      setIsModalOpen(true);
    }
  };

  const refreshActivePositions = () => {
    fetchActivePositons();
  };

  const fetchPlaces = async () => {
    setPlaceDropdownLoading(true)
    const apiResponse = await PlaceService.GetPlacesPaged(placeDropDownPageIndex.current + 1, entriesPerFetch, placeQuery);
    const data: PaginatedList<Place> = { ...apiResponse, list: apiResponse.places }
    placeDropDownPageIndex.current = data.currentPage
    placeDropdownEntries.current = placeDropdownEntries.current.concat(data.list)
    let newEntries: dropdownEntry[] = placeDropdownEntries.current.filter((place) => place.id != employee.place_Id).map((place) => (
      {
        key: place.id,
        text: place.name,
        value: place.id,
        content: place.name
      }
    ))
    if (employee.place_Id.length > 0) {
      newEntries = [{ key: employee.place_Id, value: employee.place_Id, text: selectedPlaceName }, ...newEntries]
    }
    setPlaceDropdownLoading(false)
    setPlaceDropdown(newEntries)
  }

  const confirmReset = () => {
    setIsConfirmModalOpen(true);
  }

  const handleReset = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setEmployee({
      ...employee, place_Id: "", image: null,
      provinceId: "", wardId: "", districtId: "", PositionId: ""
    });
    setpreviewImg("");
    reset();
    setIsConfirmModalOpen(false);
  }

  useEffect(() => {
    fetchActivePositons();
    fetchNextId();
    fetchProvinces();
  }, [])

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

  return (
    <>
      {isConfirmModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white min-w-[150px] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
            <p className="mb-6">{message["MSG 44"]}</p>
            <div className="flex justify-end space-x-4">
              <>
                <button
                  onClick={(e) => handleReset(e)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  Confirm
                </button>
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
                  Cancel
                </button>
              </>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white min-w-[150px] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
            <p className="mb-6">{modalMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  if (modalState.toLowerCase() === "success") navigate('/employee')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl border-2 mx-auto mt-2 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Employee</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-bold">
                <strong>Employee Id</strong>
              </label>
              <input
                type="text"
                disabled
                value={employeeId}
                className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <small style={{ fontStyle: "italic" }}>
                This field is read-only
              </small>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Username <span className="text-red-600">(*)</span>
              </label>
              <input
                {...register("username")}
                style={{ borderColor: errors.username ? 'red' : '' }}
                className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.username && (
                <div className="ui pointing red basic label">{errors.username.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Employee Name <span className="text-red-600">(*)</span>
              </label>
              <input
                {...register("employee_Name")}
                style={{ borderColor: errors.employee_Name ? 'red' : '' }}
                className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.employee_Name && (
                <div className="ui pointing red basic label">{errors.employee_Name.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Date of Birth <span className="text-red-600">(*)</span>
              </label>
              <input
                type="date"
                {...register("date_Of_Birth")}
                style={{ borderColor: errors.date_Of_Birth ? 'red' : '' }}
                className={`border p-2 w-full rounded-md focus:outline-none focus:ring-2`}
              />
              {errors.date_Of_Birth && (
                <div className="ui pointing red basic label">{errors.date_Of_Birth.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Phone <span className="text-red-600">(*)</span>
              </label>
              <div className="flex">
                <select
                  disabled
                  className="border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                >
                  <option value="+84">+84 (VN)</option>
                </select>
                <input
                  {...register("phone")}
                  style={{ borderColor: errors.phone ? 'red' : '' }}
                  className={`border p-2 w-full rounded-md focus:outline-none focus:ring-2`}
                  placeholder="Enter phone number"
                  maxLength={10}
                />
              </div>
              {errors.phone && (
                <div className="ui pointing red basic label">{errors.phone.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Password <span className="text-red-600">(*)</span>
              </label>
              <input
                {...register("password")}
                type="password"
                autoComplete="on"
                style={{ borderColor: errors.password ? 'red' : '' }}
                className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ul className="mb-1 mt-1 space-y-1">
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

            <div>
              <label className="block mb-2 text-sm font-bold">
                Confirm Password <span className="text-red-600">(*)</span>
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                autoComplete="on"
                style={{ borderColor: errors.confirmPassword ? 'red' : '' }}
                className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmPassword && (
                <div className="ui pointing red basic label">{errors.confirmPassword.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Province <span className="text-red-600">(*)</span>
              </label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-2 top-3 text-gray-400"></i>
                <Dropdown
                  placeholder="Select Province"
                  search
                  style={{ borderColor: errors.provinceId ? 'red' : '' }}
                  selection
                  value={getValues("provinceId")}
                  onChange={handleProvinceChange}
                  options={provinces.map((province) => ({
                    key: province.id,
                    value: province.id,
                    text: province.name,
                  }))}
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>
              {errors.provinceId && (
                <div className="ui pointing red basic label">{errors.provinceId.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                District <span className="text-red-600">(*)</span>
              </label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-2 top-3 text-gray-400"></i>
                <Dropdown
                  placeholder="Select District"
                  search
                  selection
                  style={{ borderColor: errors.districtId ? 'red' : '' }}
                  {...register("districtId")}
                  onChange={handleDistrictChange}
                  value={getValues("districtId")}
                  options={districts.map((district) => ({
                    key: district.id,
                    value: district.id,
                    text: district.name
                  }))}
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.districtId && (
                <div className="ui pointing red basic label">{errors.districtId.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Ward <span className="text-red-600">(*)</span>
              </label>
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-2 top-3 text-gray-400"></i>
                <Dropdown
                  placeholder="Select Ward"
                  search
                  selection
                  value={getValues("wardId")}
                  style={{ borderColor: errors.wardId ? 'red' : '' }}
                  {...register("wardId")}
                  onChange={(_, data) => {
                    const selectedValue = data.value as string;
                    setEmployee((prev) => ({
                      ...prev,
                      wardId: selectedValue,
                    }));
                    setValue("wardId", selectedValue, {
                      shouldValidate: true,
                    });
                  }}

                  options={wards.map((ward) => ({
                    key: ward.id,
                    value: ward.id,
                    text: ward.name
                  }))}
                />
              </div>
              {errors.wardId && (
                <div className="ui pointing red basic label">{errors.wardId.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Email <span className="text-red-600">(*)</span>
              </label>
              <input
                {...register("email")}
                style={{ borderColor: errors.email ? 'red' : '' }}
                className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <div className="ui pointing red basic label">{errors.email.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Address <span className="text-red-600">(*)</span>
              </label>
              <input
                {...register("address")}
                style={{ borderColor: errors.address ? 'red' : '' }}
                className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && (
                <div className="ui pointing red basic label">{errors.address.message}</div>
              )}

            </div>

            <GridRow>
              <GridColumn width={6}>
                <div>
                  Working Place <p className="text-red-500 inline">(*)</p>
                </div>
                <div style={{ display: "flex" }}>
                  <div style={{ flexGrow: 1 }}>
                    <Dropdown
                      options={placeDropdown}
                      placeholder={selectedPlaceName ?? '-Select Place-'}
                      lazyLoad
                      fluid
                      search
                      selection
                      style={{ borderColor: errors.place_Id ? 'red' : '' }}
                      value={employee.place_Id}
                      {...register("place_Id")}
                      onChange={(e, data) => {
                        handleSelectPlace(e, data);
                        placeError.current = undefined;
                      }}
                      searchQuery={placeQuery}
                      onSearchChange={(_, { searchQuery }) => setPlaceQuery(searchQuery)}
                      onClose={() => setPlaceQuery("")}
                      loading={placeDropdownLoading}
                    />
                    {errors.place_Id && (
                      <div className="ui pointing red basic label">{errors.place_Id.message}</div>
                    )}
                  </div>
                  <div>
                    <Button
                      fluid
                      color="teal"
                      style={{ paddingBottom: "13px", marginLeft: "3px" }}
                      type="button"
                      onClick={() => setPlaceFormDisplay(true)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </GridColumn>
            </GridRow>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Position <span className="text-red-600">(*)</span>
              </label>
              <Dropdown
                {...register("PositionId")}
                search
                selection
                placeholder="Select a position"
                style={{ borderColor: errors.PositionId ? 'red' : '' }}
                className="border border-gray-300 p-2 w-1/2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                options={activePositions.map((pos) => ({
                  key: pos.id,
                  value: pos.id,
                  text: pos.positionName
                }))}
                onChange={handlePositionSelect}
                value={employee.PositionId}
              />
              <PositionModal refreshActivePositions={refreshActivePositions} />
              {errors.PositionId && (
                <div className="ui pointing red basic label">{errors.PositionId.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Gender <span className="text-red-600">(*)</span>
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register("gender")}
                    style={{ borderColor: errors.gender ? 'red' : '' }}
                    value="1"
                    className="form-radio"
                  />
                  <span className="ml-2">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register("gender")}
                    value="0"
                    className="form-radio"
                  />
                  <span className="ml-2">Female</span>
                </label>
              </div>
              {errors.gender && (
                <div className="ui pointing red basic label">{errors.gender.message}</div>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Is Admin:
              </label>
              <input
                type="checkbox"
                checked={watch("role_Id") === 3}
                onChange={(e) => {
                  const newRole = e.target.checked ? 3 : 2;
                  setValue('role_Id', newRole, {
                    shouldValidate: true,
                    shouldDirty: true
                  });
                }}
                className="form-checkbox"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold">
                Is Active:
              </label>
              <input
                type="checkbox"
                {...register("status")}
                className="form-checkbox"
              />
            </div>

            {
              <div>
                <label className="block mb-2 text-sm font-bold">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("image")}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                />

                {previewImg && (
                  <div className="mt-4">
                    <img
                      src={previewImg}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            }
          </div>

          <div className="flex justify-start mt-6 space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500"
            >
              Save
            </button>
            <button
              onClick={confirmReset}
              type="button"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500"
            >
              Reset
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-500"
              onClick={() => navigate("/employee")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <PlaceModal active={placeFormDisplay} onClose={() => {
        setPlaceDropdownLoading(true)
        placeDropDownPageIndex.current = 0
        placeDropdownEntries.current = []
        const wrap = async () => {
          await fetchPlaces()
          setPlaceDropdownLoading(false)
        }
        wrap();
        setPlaceQuery('')
        setPlaceFormDisplay(false)
      }} />
    </>
  );
};

export default CreateEmployee;
