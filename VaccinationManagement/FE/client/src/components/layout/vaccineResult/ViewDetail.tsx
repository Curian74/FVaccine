import {
    Button,
    Dialog,
    IconButton,
    Typography,
    DialogBody,
    DialogHeader,
    DialogFooter,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { VaccinationResult } from "@/types/vaccinationResult";
import { Phone, User, MapPin, IdCard, Syringe, BookOpenText, Hospital, MapPinned, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/helpers/utils";
import { VaccinationResultStatus } from "@/types/vaccinationResultStatus";
import { useNavigate } from "react-router-dom";

interface ViewDetailInjectionDialogProps {
    open: boolean;
    handleClose: () => void;
    handleCancelInjection: () => void;
    result: VaccinationResult;
}

interface Location {
    id: string;
    name: string;
}



export function ViewDetailInjectionDialog({ open, handleClose, handleCancelInjection, result }: ViewDetailInjectionDialogProps) {
    const [provinceName, setProvinceName] = useState(null);
    const [districtName, setDistrictName] = useState(null);
    const [wardName, setWardName] = useState(null);

    const [openConfirm, setOpenConfirm] = useState(false);

    const handleOpen = () => setOpenConfirm((prev) => !prev);

    useEffect(() => {
        const fetchName = async () => {
            try {
                const customer = result.customer;

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
                        setProvinceName(province.name);
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
                        setDistrictName(district.name);
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
                        setWardName(ward.name);
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
    }, [result.customer]);


    const nav = useNavigate();

    const handleUpdate = () => {
        nav(`/home/book-appointment?updateId=${result.id}`);
        handleClose();
    };

    return (
        <>

            <Dialog size="md" open={open} handler={handleClose} className="p-4"
                onPointerEnterCapture={() => null}
                onPointerLeaveCapture={() => null}
                placeholder=""
            >
                <DialogHeader className="relative m-0 mb-3 block"
                    onPointerEnterCapture={() => null}
                    onPointerLeaveCapture={() => null}
                    placeholder=""
                >
                    <Typography variant="h4" color="blue-gray"
                        onPointerEnterCapture={() => null}
                        onPointerLeaveCapture={() => null}
                        placeholder=""
                    >
                        Vaccination history details
                    </Typography>
                    <IconButton
                        size="sm"
                        variant="text"
                        className="!absolute right-3.5 top-3.5"
                        onClick={handleClose}
                        onPointerEnterCapture={() => null}
                        onPointerLeaveCapture={() => null}
                        placeholder=""
                    >
                        <XMarkIcon className="h-4 w-4 stroke-2" />
                    </IconButton>
                </DialogHeader>
                <DialogBody className="space-y-3 -mt-5 pb-6 h-[38rem] overflow-scroll"
                    onPointerEnterCapture={() => null}
                    onPointerLeaveCapture={() => null}
                    placeholder="">
                    <div>
                        <h1 className="font-bold text-xl text-gray-800">
                            Service User
                        </h1>
                    </div>
                    <div className="flex p-3 gap-x-5 border-gray-400 border-2 rounded-xl">
                        <div className="flex gap-x-5 pr-5 border-r-2 border-gray-300">
                            <User />
                            <div>
                                <p className="font-bold text-black text-lg">{result.customer?.full_Name}</p>
                                <span>{result.customer?.gender ? "Male" : "Female"}, </span>
                                <span>{result.customer!.date_Of_Birth.toLocaleString()}</span>
                                <p>CID: {result.customer_Id}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex gap-x-10 mb-3">
                                <div className="flex gap-x-3">
                                    <IdCard />
                                    <span>{result.customer?.identity_Card}</span>
                                </div>
                                <div className="flex gap-x-3">
                                    <Phone />
                                    <p>{result.customer?.phone}</p>
                                </div>
                            </div>
                            <div className="flex gap-x-3">
                                <MapPin />
                                <span className="mt-1.5">{result.customer?.address}, {wardName}, {districtName}, {provinceName}</span>
                            </div>

                        </div>
                    </div>

                    <div>
                        <h1 className="font-bold text-xl text-gray-800">
                            Vaccine
                        </h1>
                    </div>
                    <div className="flex p-3 gap-x-5 border-gray-400 border-2 rounded-xl">
                        <div className="flex gap-x-5 pr-5 border-r-2 border-gray-300">
                            <Syringe />
                            <div>
                                <p className="font-bold text-black text-lg">{result.vaccine?.vaccine_Name}</p>
                                <div className="flex gap-x-3 mt-1.5">
                                    <MapPin />
                                    <span className="mt-1.5">{result.vaccine?.origin}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex gap-x-10 mb-3">
                                <div className="flex gap-x-3">
                                    <span>No. Requiered injection: {(result.vaccine?.required_Injections || 1) < 100 ? result.vaccine?.required_Injections : "Yearly"}</span>
                                </div>
                                <div className="flex gap-x-3">
                                    <CalendarClock />
                                    <p>Time between injections: {result.vaccine?.time_Between_Injections} days</p>
                                </div>
                            </div>
                            <div className="flex gap-x-3">
                                <BookOpenText />
                                <span>{result.prevention}</span>
                            </div>

                        </div>
                    </div>

                    <div>
                        <h1 className="font-bold text-xl text-gray-800">
                            Vaccination Center
                        </h1>
                    </div>
                    <div className="flex p-3 gap-x-5 border-gray-400 border-2 rounded-xl">
                        <div className="flex gap-x-5 pr-5 border-r-2 border-gray-300">
                            <Hospital />
                            <div>
                                <p className="font-bold text-black text-lg">{result.injection_Place?.name}</p>
                                Injection number: {result.injection_Number}

                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-x-10 ml-3">
                                <div>
                                    <span>
                                        Date: {result.injection_Date}
                                    </span>
                                </div>
                                {result?.next_Injection_Date &&
                                    <div>
                                        <span>
                                            Next date: {result.next_Injection_Date}
                                        </span>
                                    </div>
                                }
                            </div>
                            <div className="flex gap-x-3">
                                <MapPinned />
                                <span className="mt-0.5">{result.injection_Place?.address}</span>
                            </div>
                        </div>
                    </div>
                    {/* <div className="flex justify-around p-3 border-2 border-gray-400 rounded-xl">
                        <div className="bg-gray-400 h-6 w-0.5 "></div>

                    </div> */}

                    <div>
                        <h1 className="font-bold text-xl text-gray-800">
                            Status
                        </h1>
                    </div>
                    <div className="flex flex-col text-center font-bold text-black items-center p-1 rounded-md w-full bg-gray-200 justify-between gap-4 md:flex-row">

                        <div className={cn("mx-auto py-2 w-full", result.isVaccinated === VaccinationResultStatus.NotInjected && "bg-blue-gray-200 rounded-md")}>
                            <p className="">Uninjected</p>
                        </div>
                        <div className={cn("mx-auto py-2 rounded-md w-full", result.isVaccinated === VaccinationResultStatus.Injected && "bg-green-200 text-green-900 rounded-md")}>
                            <p className="">Injected</p>
                        </div>
                        <div className={cn("mx-auto py-2 w-full",
                            result.isVaccinated === VaccinationResultStatus.Cancelled && "bg-red-200  text-red-800 rounded-md"
                        )}>
                            <p className="">Canceled</p>
                        </div>
                    </div>

                    <DialogFooter
                        onPointerEnterCapture={() => null}
                        onPointerLeaveCapture={() => null}
                        placeholder=""
                    >
                        {result.isVaccinated === VaccinationResultStatus.NotInjected &&
                            <div>
                                <Button className="ml-auto" onClick={handleOpen}
                                    onPointerEnterCapture={() => null}
                                    onPointerLeaveCapture={() => null}
                                    placeholder=""
                                    size="sm"
                                    color="white"
                                >
                                    Cancel
                                </Button>
                                <Button className="ml-3" onClick={handleUpdate}
                                    onPointerEnterCapture={() => null}
                                    onPointerLeaveCapture={() => null}
                                    placeholder=""
                                    size="sm"
                                    color="amber"
                                >
                                    Update
                                </Button>
                            </div>
                        }
                        <Button className="ml-auto" onClick={handleClose}
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                            color="teal"
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogBody>

                <Dialog
                    onPointerEnterCapture={() => null}
                    onPointerLeaveCapture={() => null}
                    placeholder=""
                    open={openConfirm} handler={handleOpen} size="sm">
                    <DialogHeader
                        onPointerEnterCapture={() => null}
                        onPointerLeaveCapture={() => null}
                        placeholder=""
                    >Confirm Cancel</DialogHeader>
                    <DialogBody
                        onPointerEnterCapture={() => null}
                        onPointerLeaveCapture={() => null}
                        placeholder=""
                    >
                        <p>You have selected to cancel this schedule</p>
                        <p>If this was the action that you wanted to do, please confirm your choice, or cancel and return your page</p>
                    </DialogBody>
                    <DialogFooter
                        onPointerEnterCapture={() => null}
                        onPointerLeaveCapture={() => null}
                        placeholder=""
                    >
                        <Button
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                            variant="text"
                            color="red"
                            onClick={handleOpen}
                            className="mr-1"
                        >
                            <span>Cancel</span>
                        </Button>
                        <Button
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                            variant="gradient" color="green" onClick={() => {
                                handleCancelInjection()
                                setOpenConfirm(false)
                            }}>
                            <span>Confirm</span>
                        </Button>
                    </DialogFooter>
                </Dialog>

            </Dialog>

        </>
    );
}