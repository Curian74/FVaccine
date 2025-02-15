import { useState, useEffect, SyntheticEvent, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Position } from "@/types/position";
import PositionService from "@/services/PositionService";
import message from "@/helpers/constants/message.json";
import EmployeeService from "@/services/EmployeeService";
import PositionModal from "./components/PositionModal";
import * as Yup from 'yup';
import {
  Button,
  GridRow,
  GridColumn,
  Dropdown,
  DropdownProps,
} from 'semantic-ui-react'
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Place } from "@/types/place";
import { dropdownEntry } from "../schedule/utils/scheduleUtils";
import PlaceService from "@/services/PlaceService";
import { PaginatedList } from "@/helpers/utils";
import PlaceModal from "@/components/layout/place/PlaceModal";
import ChangePasswordModal from "./components/ChangePasswordModal";

const UpdateEmployee = () => {
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const navigate = useNavigate();
  const { id } = useParams();
  const entriesPerFetch = 10;
  const baseAPI = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePositions, setActivePositions] = useState<Position[]>([]);
  const [imageDisplay, setImageDisplay] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>();
  const placeDropdownEntries = useRef<Place[]>([]);
  const [placeError, setPlaceSelectError] = useState<string | undefined>(undefined);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeFormDisplay, setPlaceFormDisplay] = useState(false);
  const placeDropDownPageIndex = useRef(0);
  const [placeDropdown, setPlaceDropdown] = useState<dropdownEntry[]>([]);
  const [placeDropdownLoading, setPlaceDropdownLoading] = useState(false);

  const [isConfirmationModal, setIsConfirmationModal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const edited = useRef(false);

  //Validation and message state
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const validationSchema = Yup.object().shape({
    id: Yup.string(),
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
    email: Yup.string().email("Invalid email").required("Email is required").trim(),
    address: Yup.string().required("Address is required").trim(),
    provinceId: Yup.string().required("Province is required"),
    districtId: Yup.string().required("District is required"),
    wardId: Yup.string().required("Ward is required"),
    place_Id: Yup.string().required("Working place is required")
      .test("is-active", "Working place is required",
        function (value) {
          const selectedPlace = placeDropdownEntries.current.find(place => place.id === value);
          return selectedPlace ? selectedPlace.status : false;
        }),
    positionId: Yup.string().required("Position is required")
      .test("is-active",
        "Position is required",
        function (value) {
          const selectedPosition = activePositions.find((pos) => pos.id === value);
          return selectedPosition?.status || false;
        }),
    gender: Yup.string().required("Gender is required"),
    role_Id: Yup.number(),
    status: Yup.boolean(),
    image: Yup.mixed(),
  });

  const { register, handleSubmit, formState: { errors, submitCount }, reset, trigger, watch, setValue } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      id: "",
      username: "",
      employee_Name: "",
      date_Of_Birth: getCurrentDate(),
      phone: "",
      email: "",
      wardId: "",
      districtId: "",
      provinceId: "",
      address: "",
      place_Id: "",
      positionId: "",
      gender: "0",
      role_Id: 2,
      status: false,
      image: null
    },
  });

  const [employee, setEmployee] = useState({
    id: "",
    username: "",
    employee_Name: "",
    date_Of_Birth: getCurrentDate(),
    phone: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    email: "",
    address: "",
    wardId: "",
    districtId: "",
    provinceId: "",
    place_Id: "",
    positionId: "",
    gender: "0",
    image: null as File | null,
    role_Id: 0,
    imageURL: "",
    status: false,
  });

  const roleId = watch('role_Id');

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`${baseAPI}/Employees/${id}`);
      const data = await response.data;

      console.log(data)

      reset({
        id: data.id || "",
        username: data.username || "",
        employee_Name: data.employee_Name || "",
        date_Of_Birth: data.date_Of_Birth || getCurrentDate(),
        phone: data.phone?.substring(1) || "",
        email: data.email || "",
        address: data.address || "",
        provinceId: data.provinceId || "",
        districtId: data.districtId || "",
        wardId: data.wardId || "",
        place_Id: data.place_Id || "",
        positionId: data.positionId || "",
        gender: data.gender?.toString() || "0",
        role_Id: data.role_Id || undefined,
        status: data.status || false,
        image: data.image || "",
      });

      setImageDisplay(data.image ? `${baseUrl}${data.image}` : '')

      setEmployee(prev => ({
        ...prev,
        id: data.id,
        imageURL: data.image || "",
        place_Id: data.place_Id || "",
        provinceId: data.provinceId || "",
        districtId: data.districtId || "",
        wardId: data.wardId || "",
        password: "",
        newPassword: "",
        confirmPassword: "",
        role_Id: data.role_Id || undefined
      }));

      // Fetch districts and wards if the provinceId and districtId are available
      if (data.provinceId) {
        fetchDistricts(data.provinceId);
      }

      if (data.districtId) {
        fetchWards(data.districtId);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setLoading(false);
    }
  };

  const handleSelectPlace = (_: SyntheticEvent, dropDownProps: { value?: string | number | boolean | (string | number | boolean)[] | undefined }) => {
    edited.current = true;
    setSelectedPlaceName(placeDropdownEntries.current.find(place => place.id === dropDownProps.value?.toString())?.name)
    setEmployee({ ...employee, place_Id: dropDownProps.value?.toString() ?? '' });
    setValue("place_Id", dropDownProps.value?.toString() ?? '');
  }

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

    setValue("provinceId", data.value?.toString() ?? '', { shouldValidate: submitCount > 0 });
    setValue("districtId", '', { shouldValidate: submitCount > 0 });
    setValue("wardId", '', { shouldValidate: submitCount > 0 });

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

    setValue("districtId", data.value?.toString() ?? '', { shouldValidate: submitCount > 0 });
    setValue("wardId", '', { shouldValidate: submitCount > 0 });

    setWards([]);
    fetchWards(data.value as string);
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
      const selectedPlace = placeDropdownEntries.current.find(place => place.id === employee.place_Id);
      if (selectedPlace) {
        newEntries = [{ key: selectedPlace.id, value: selectedPlace.id, text: selectedPlace.name }, ...newEntries];
      }
    }

    setPlaceDropdown(newEntries);

    await trigger("place_Id");
  }

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  useEffect(() => {
    if (employee.imageURL) {
      setImageDisplay(`${baseUrl}${employee.imageURL}`);
    }
  }, [employee.imageURL]);

  const togglePasswordModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setShowPasswordModal(!showPasswordModal);
  };

  const fetchActivePositons = async () => {
    try {
      const response: Position[] = await PositionService.GetActivePositions();
      setActivePositions(response || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }

    finally {
      setLoadingPositions(false);
      await trigger("positionId");
    }
  };

  useEffect(() => {
    fetchActivePositons();
  }, [id])

  const refreshActivePositions = () => {
    fetchActivePositons();
  };

  useEffect(() => {
  }, [activePositions]);

  useEffect(() => {
    fetchProvinces();
  }, [])

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // setImageDisplay(URL.createObjectURL(file!));
    // setValue("image", file);
    // if (!file) {
    //   setImageDisplay("");
    //   setValue("image", employee.image);
    //   return;
    // }

    if (!file!.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/i)) {
      event.target.value = '';
      setValue("image", watch("image"));
      return;
    }
    setImageDisplay(URL.createObjectURL(file!));
    setValue("image", file);
  };

  const confirmSubmit = () => {
    setIsSubmitting(true);
    setIsConfirmationModal(true);
    setModalTitle("Confirmation");
    setModalMessage(message["MSG 45"]);
    setIsModalOpen(true);
  };

  const confirmReset = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setIsSubmitting(false);
    setIsConfirmationModal(true);
    setModalTitle("Confirmation");
    setModalMessage(message["MSG 44"]);
    setIsModalOpen(true);
  };

  const handleReset = async () => {
    fetchEmployee();
    setIsModalOpen(false);
  }

  const onSubmit = async (formData: any) => {
    const submitData = new FormData();
    console.log(formData);
    // Append all form fields to FormData
    Object.keys(formData).forEach((key) => {
      if (key === "image" && formData.image) {
        submitData.append(key, formData.image);
      } else {
        submitData.append(key, formData[key]?.toString() || "");
      }
    });

    try {
      setIsConfirmationModal(false);
      const response = await axios.put(
        `${baseAPI}/Employees/${formData.id}`,
        submitData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setModalTitle("Success");
        setModalMessage(message["MSG 22"]);
        setIsModalOpen(true);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update employee. Please try again!";
      setModalMessage(errorMessage);
      setModalTitle("Error");
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white min-w-[150px] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{modalTitle}</h2>
            <p className="mb-6">{modalMessage}</p>
            <div className="flex justify-end space-x-4">
              {isConfirmationModal ? (
                <>
                  <button
                    onClick={isSubmitting ? handleSubmit(onSubmit) : handleReset}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    Confirm
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    if (modalTitle === "Success") {
                      navigate("/employee");
                    }
                  }}
                  className={`px-4 py-2 rounded-md ${modalTitle === "Success"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-600 text-white"
                    }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl border-2 mx-auto mt-2 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Update Employee</h2>
        <form>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium">
                <strong>Employee Id</strong>
              </label>
              <input
                type="text"
                disabled
                {...register("id")}
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
                type="text"
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
                type="text"
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
                Password
              </label>
              <input
                type="password"
                name="password"
                disabled
                autoComplete="on"
                value={employee.password}
                className="border border-gray-300 p-2 w-1/2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={togglePasswordModal}
                className="mx-6 focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                type="button"
              >
                <p className="font-medium">Change Password</p>
              </button>
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
                  selection
                  value={employee.provinceId}
                  onChange={handleProvinceChange}
                  style={{ borderColor: errors.provinceId ? 'red' : '' }}
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
                  value={employee.districtId}
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
                  style={{ borderColor: errors.wardId ? 'red' : '' }}
                  value={employee.wardId}
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
                      value={watch("place_Id")}
                      {...register("place_Id")}
                      onChange={async (e, data) => {
                        handleSelectPlace(e, data);
                        setValue("place_Id", data.value as string)
                        await trigger("place_Id");
                        setPlaceSelectError(undefined);
                      }}
                      searchQuery={placeQuery}
                      onSearchChange={(_, { searchQuery }) => setPlaceQuery(searchQuery)}
                      onClose={() => setPlaceQuery("")}
                      loading={placeDropdownLoading}
                      error={!!placeError}
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

              {loadingPositions ? (
                <div>Loading positions...</div>
              ) : (
                <Dropdown
                  search
                  selection
                  placeholder="Select a position"
                  {...register("positionId")}
                  value={watch("positionId")}
                  onChange={async (_, { value }) => {
                    setValue("positionId", value as string);
                    await trigger("positionId");
                    setEmployee(prev => ({ ...prev, positionId: value as string }));
                  }}
                  style={{ borderColor: errors.positionId ? 'red' : '' }}
                  className="border border-gray-300 p-2 w-1/2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  options={activePositions.map((pos) => ({
                    key: pos.id,
                    value: pos.id,
                    text: pos.positionName
                  }))}
                />
              )}

              <PositionModal refreshActivePositions={refreshActivePositions} />

              {errors.positionId && (
                <div className="ui pointing red basic label">{errors.positionId.message}</div>
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
                    value="0" // Value for "Female"
                    className="form-radio"
                  />
                  <span className="ml-2">Female</span>
                </label>
              </div>
              {errors.gender && (
                <div className="ui pointing red basic label">{errors.gender.message}</div>
              )}
            </div>

            {employee.role_Id !== 3 && (
              <>
                <div>
                  <label className="block mb-2 text-sm font-bold">
                    Is Admin:
                  </label>
                  <input
                    type="checkbox"
                    checked={roleId === 3}
                    onChange={(e) => {
                      const newRoleId = e.target.checked ? 3 : 2;
                      setValue('role_Id', newRoleId, {
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
              </>
            )}

            {
              <div>
                <label className="block mb-2 text-sm font-bold">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
                />

                {imageDisplay.trim() && (
                  <div className="mt-4">
                    <img
                      src={imageDisplay}
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
              onClick={handleSubmit(confirmSubmit)}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500"
            >
              Save
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-500"
              onClick={(e) => confirmReset(e)}>
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
      {showPasswordModal && (
        <ChangePasswordModal isModalOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
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

export default UpdateEmployee;
