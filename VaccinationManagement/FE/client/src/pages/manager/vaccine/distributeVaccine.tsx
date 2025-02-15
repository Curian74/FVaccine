import VaccineService from "@/services/VaccineService";
import { Place } from "@/types/place";
import { Vaccine } from "@/types/vaccine";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, DropdownProps } from "semantic-ui-react";
import message from '@/helpers/constants/message.json';
import { Response } from '@/types/response';
import PlaceService from "@/services/PlaceService";
import { Distribution } from "@/types/distribution";
import PlaceModal from "@/components/layout/place/PlaceModal";


const DistributeVaccine = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [firstErrorField, setFirstErrorField] = useState<string | null>(null);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isConfirmAction, setComfirmAction] = useState(false);
    const [isSubmit, setIsSubmit] = useState(false);
    const [displayPlaceForm, setDisplayPlaceForm] = useState(false);
    

    const navigate = useNavigate();

    const [remainingCount, setRemainingCount] = useState<number | null>(null);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [hasVaccine, setHasVaccine] = useState(false);
    const [places, setPlaces] = useState<Place[]>([]);
    const [hasPlace, setHasPlace] = useState(false);

    const quantityRef = useRef<HTMLInputElement>(null);

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    let today = getCurrentDate();
    const [distributionData, setDistributionData] = useState({
        id: '',
        vaccine_Id: '',
        place_Id: '',
        quantity_Imported: null,
        quantity_Injected: 0,
        date_Import: today,
    });

    useEffect(() => {
        setLoading(true);

        fetchVaccines();
        fetchPlaces();

        setLoading(false);
    }, []);

    // Fetch Vaccine
    const fetchVaccines = async () => {
        try {
            const data: Vaccine[] = await VaccineService.GetAllVaccines();
            if (data === null || data.length == 0) {
                setHasVaccine(false);
                setPopupMessage(message["MSG 38"]);
                setPopupVisible(true);
            } else {
                setHasVaccine(true);
            }
            setVaccines(data || []);
            console.log(data);
        } catch (e) {
            const error = e as AxiosError;
            setError((error?.response?.data as Response)?.message || error.message);
        }
    };

    // Fetch Place
    const fetchPlaces = async () => {
        try {
            const data: Place[] = await PlaceService.GetPlaces();
            if (data === null || data.length == 0) {
                setHasPlace(false);
                setPopupMessage(message["MSG 40"]);
                setPopupVisible(true);
            } else {
                setHasPlace(true);
            }
            setPlaces(data || []);
            console.log(data);
        } catch (e) {
            const error = e as AxiosError;
            setError((error?.response?.data as Response)?.message || error.message);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setDistributionData(prevState => ({
            ...prevState,
            [name]: (name === "quantity_Imported") ? (!isNaN(parseInt(value)) ? parseInt(value) : null) : value
        }));
        setValidationErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    };

    const handleVaccineChange = (_: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
        const { value } = data;
        handleInputChange({ target: { name: 'vaccine_Id', value } } as React.ChangeEvent<HTMLInputElement>);
    
        // Find the selected vaccine and update the remaining count
        const selectedVaccine = vaccines.find(vaccine => vaccine.id === value);
        setRemainingCount(selectedVaccine?.number_Of_Injection ?? null);
    };

    useEffect(() => {
        if (firstErrorField) {
            if (firstErrorField === "quantity_Imported") quantityRef.current?.focus();
        }
    }, [firstErrorField]);

    const validateForm = async () => {
        const errors: { [key: string]: string } = {};
        if (!distributionData.vaccine_Id) errors.vaccine_Id = "Vaccine is required.";
        if (!distributionData.place_Id) errors.place_Id = "Place is required.";
        if (!distributionData.quantity_Imported) errors.quantity_Imported = "Quantity Imported is required.";
        if (!remainingCount) errors.vaccine_Id = "Please update Number of Vaccine in Update Vaccine page.";
        if (remainingCount && distributionData.quantity_Imported && (distributionData.quantity_Imported > remainingCount!)) errors.quantity_Imported = "Quantity Imported must not be higher than Number of Vaccine remaining.";

        setValidationErrors(errors);

        const firstError = Object.keys(errors).includes("quantity_Imported") ? "quantity_Imported" : null;
        setFirstErrorField(firstError);

        return Object.keys(errors).length === 0;
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

        try {
            console.log(distributionData);
            const data: Distribution = await VaccineService.DistributeVaccine(distributionData);
            console.log('Distribution created successfully:', data);
            setPopupMessage(message["MSG 23"]);
            setComfirmAction(false);
            setPopupVisible(true);
        } catch (error) {
            console.error('Error creating vaccine:', error);
        }

    };

    const handleClose = () => {
        setPopupVisible(false);
        setIsSubmit(false);
        if (!hasVaccine) {
            navigate('/vaccine/add');
        } else {
            if (!hasPlace) {
                navigate('/vaccine');
            } else {
                if (isSubmit) {
                    navigate('/vaccine');
                }
            }
        }
    };

    const handleResetButton = async () => {
        setPopupMessage(message["MSG 44"]);
        setPopupVisible(true);
        setComfirmAction(true);
    };

    const handleReset = async () => {
        setPopupVisible(false);

        setDistributionData(prevState => ({
            ...prevState,
            id: '',
            vaccine_Id: '',
            place_Id: '',
            quantity_Imported: null,
            quantity_Injected: 0,
            date_Import: today,
        }));
        setRemainingCount(null);
        setValidationErrors({});
        setFirstErrorField(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <div className="w-full mx-auto pr-8 mt-10">
                <h1 className="text-center text-2xl font-black mb-5">DISTRIBUTE VACCINE TO PLACE</h1>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white p-5 rounded shadow-md mb-5">
                        <div className="grid grid-cols-3 gap-4 mb-4 flex">
                            <div>
                                <label className="block mb-2">Vaccine(<span className="text-red-500">*</span>):</label>

                                <Dropdown
                                    placeholder="Select Vaccine"
                                    fluid
                                    search
                                    selection
                                    value={distributionData.vaccine_Id}
                                    onChange={handleVaccineChange}
                                    options={vaccines.map(vaccine => ({
                                        key: vaccine.id,
                                        value: vaccine.id,
                                        text: vaccine.vaccine_Name,
                                    }))}
                                />
                                {validationErrors.vaccine_Id && <div className="ui pointing red basic label">{validationErrors.vaccine_Id}</div>}
                            </div>

                            <div>
                                <label className="block mb-2">Place(<span className="text-red-500">*</span>):</label>

                                <div className="flex">
                                  <Dropdown
                                      placeholder="Select Place"
                                      fluid
                                      search
                                      selection
                                      value={distributionData.place_Id}
                                      onChange={(_, { value }) => handleInputChange({ target: { name: 'place_Id', value } } as React.ChangeEvent<HTMLInputElement>)}
                                      options={places.map(place => ({
                                          key: place.id,
                                          value: place.id,
                                          text: place.name,
                                      }))}
                                  />
                                  <Button
                                  color="teal"
                                  style={{ paddingBottom: "13px", marginLeft: "3px" }}
                                  type="button"
                                  onClick={() => setDisplayPlaceForm(true)}
                                  >
                                  Manage
                                  </Button>
                                </div>
                                {validationErrors.place_Id && <div className="ui pointing red basic label">{validationErrors.place_Id}</div>}
                            </div>

                            <div>
                                <label className="block mb-2">Quantity Import(<span className="text-red-500">*</span>):</label>
                                <input name="quantity_Imported" value={distributionData.quantity_Imported ?? ''} ref={quantityRef}
                                onChange={handleInputChange} type="text" className="w-full border border-gray-300 p-2 rounded" />
                                {validationErrors.quantity_Imported && <div className="ui pointing red basic label">{validationErrors.quantity_Imported}</div>}
                            </div>

                            <p className="text-red-500">Number of Vaccine remaining: {remainingCount ?? "Not available"}</p>
                        </div>

                        <div className="flex space-x-2 mt-10">
                            <button type="submit" className="w-20 bg-green-500 text-white px-4 py-2 rounded"
                                onClick={() => setIsSubmit(true)}
                            >Save</button>
                            <button type="button" className="w-20 bg-blue-500 text-white px-4 py-2 rounded"
                                onClick={handleResetButton}>Reset</button>
                            <button type="button" className="w-20 bg-orange-500 text-white px-4 py-2 rounded" onClick={() => { navigate('/vaccine') }}>Cancel</button>
                        </div>
                    </div>
                </form>
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

            <PlaceModal active={displayPlaceForm} onOpen={() => setDisplayPlaceForm(true)} onClose={() => { setDisplayPlaceForm(false); fetchPlaces()}} />
        </>
    )
}

export default DistributeVaccine
