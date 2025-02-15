import {
    MagnifyingGlassIcon,
    ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { ClipboardPlus, Eye } from "lucide-react"

import {
    Card,
    CardHeader,
    Input,
    Typography,
    Button,
    CardBody,
    Chip,
    CardFooter,
    Tabs,
    TabsHeader,
    Tab,
    IconButton,
    Tooltip,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { Customer } from "@/types/user";
import CustomerService from "@/services/CustomerService";
import VaccinationResultService from "@/services/VaccinationResultService";
import { VaccinationResult } from "@/types/vaccinationResult";
import { ViewDetailInjectionDialog } from "./ViewDetail";
import { useNavigate } from "react-router-dom";

import NullImage from "@/assets/images/vaccineCharacter.png"
import { Loader } from "semantic-ui-react";
import { VaccinationResultStatus } from "@/types/vaccinationResultStatus";

const TABS = [
    {
        label: "Injections history",
        value: VaccinationResultStatus.Injected,
    },
    {
        label: "Next injections",
        value: VaccinationResultStatus.NotInjected,
    },
    {
        label: "Canceled",
        value: VaccinationResultStatus.Cancelled,
    },
];

const vaccinationStatusText: { [key in VaccinationResultStatus]: string } = {
    [VaccinationResultStatus.NotInjected]: "Uninjected",
    [VaccinationResultStatus.Injected]: "Injected",
    [VaccinationResultStatus.Cancelled]: "Cancelled",
};

const TABLE_HEAD = ["No.", "Date", "Vaccine", "Center", "Injection Number", "Status", ""];

const PAGE_SIZE = 5;

export function HistoryInjectionTable() {

    const [customer, setCustomer] = useState<Customer>();
    const [injectionResults, setInjectionResults] = useState<VaccinationResult[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<VaccinationResultStatus | -1>();
    const [open, setOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<VaccinationResult>();
    const [isLoading, setIsLoading] = useState(false);

    const nav = useNavigate();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCancelInjection = async () => {
        setIsLoading(true);
        try {
            await VaccinationResultService.UpdateStatus(selectedRow!.id, VaccinationResultStatus.Cancelled);
            setInjectionResults(
                injectionResults.filter((result) => result.id !== selectedRow!.id)
            );
            setOpen(false);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            const email = localStorage.getItem('email');
            if (email) {
                const user = await CustomerService.GetCustomerByEmail(email);
                setCustomer(user);
            }
        }
        fetchUser();
    }, [])

    useEffect(() => {
        const fetchInjectionResults = async () => {
            try {
                const data = await VaccinationResultService.GetByCustomerId(
                    customer!.id,
                    pageIndex,
                    PAGE_SIZE,
                    searchTerm,
                    status != -1 ? status : undefined
                );
                setInjectionResults(data.injection_Results);
                setTotalPages(data.totalPages);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        }
        fetchInjectionResults();
    }, [customer, pageIndex, searchTerm, status])


    const emptyRow = PAGE_SIZE - injectionResults.length;

    if (isLoading) return <Loader active inline="centered" />

    return (
        <Card className="h-full w-full"
            onPointerEnterCapture={() => null}
            onPointerLeaveCapture={() => null}
            placeholder=""
        >
            <CardHeader floated={false} shadow={false} className="rounded-none"
                onPointerEnterCapture={() => null}
                onPointerLeaveCapture={() => null}
                placeholder=""
            >
                <div className="mb-8 flex items-center justify-between gap-8">
                    <div>
                        <Typography variant="h5" color="blue-gray"
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            Injections list
                        </Typography>
                        <Typography color="gray" className="mt-1 font-normal"
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            See information about all injections schedule
                        </Typography>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                        <Button variant="outlined" size="sm" onClick={() => { setStatus(undefined) }}
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            view all
                        </Button>
                        <Button className="flex items-center gap-3" size="sm"
                            onClick={() => nav("/home/book-appointment")}
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            <ClipboardPlus strokeWidth={2} className="h-4 w-4" /> Registration
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <Tabs value="all" className="w-full">
                        <TabsHeader className="w-full"
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            {TABS.map(({ label, value }) => (
                                <Tab className="w-full" key={label} value={value}
                                    onClick={() => { setStatus(value);  setPageIndex(1) }}
                                    onPointerEnterCapture={() => null}
                                    onPointerLeaveCapture={() => null}
                                    placeholder=""
                                >
                                    &nbsp;&nbsp;{label}&nbsp;&nbsp;
                                </Tab>
                            ))}
                        </TabsHeader>
                    </Tabs>
                    <div className="w-full md:w-72">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            label="Search"
                            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                            crossOrigin={undefined}
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        />
                    </div>
                </div>
            </CardHeader>

            {injectionResults.length == 0 ? (

                <div className="">
                    <img src={NullImage} alt="" className="w-1/3 mx-auto" />
                    <p className="text-2xl text-center font-extrabold">Looks like you haven't hidden anything yet</p>
                    <div className="text-center mt-5">
                        <Button size="sm"
                            onClick={() => nav("/home/book-appointment")}
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            Registration Now
                        </Button>
                    </div>
                </div>
            )
                : (
                    <>
                        <CardBody className="overflow-scroll px-0"
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            <table className="mt-4 w-full min-w-max table-auto text-left">
                                <thead>
                                    <tr>
                                        {TABLE_HEAD.map((head, index) => (
                                            <th
                                                key={head}
                                                className="cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50"
                                            >
                                                <Typography
                                                    variant="small"
                                                    color="blue-gray"
                                                    className="flex items-center justify-between gap-2 font-normal leading-none opacity-70"
                                                    onPointerEnterCapture={() => null}
                                                    onPointerLeaveCapture={() => null}
                                                    placeholder=""
                                                >
                                                    {head}{" "}
                                                    {index !== TABLE_HEAD.length - 1 && (
                                                        <ChevronUpDownIcon strokeWidth={2} className="h-4 w-4" />
                                                    )}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {injectionResults.map(
                                        (item, index) => {
                                            const isLast = index === injectionResults.length - 1;
                                            const classes = isLast
                                                ? "p-4"
                                                : "p-4 border-b border-blue-gray-50";

                                            return (
                                                <tr key={index}>
                                                    <td className={classes}>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    color="blue-gray"
                                                                    className="font-normal"
                                                                    onPointerEnterCapture={() => null}
                                                                    onPointerLeaveCapture={() => null}
                                                                    placeholder=""
                                                                >
                                                                    {index + 1 + PAGE_SIZE * (pageIndex - 1)}
                                                                </Typography>

                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="flex flex-col">
                                                            <Typography
                                                                variant="small"
                                                                color="blue-gray"
                                                                className="font-normal"
                                                                onPointerEnterCapture={() => null}
                                                                onPointerLeaveCapture={() => null}
                                                                placeholder=""
                                                            >
                                                                {item.injection_Date}
                                                            </Typography>

                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue-gray"
                                                            className="font-normal"
                                                            onPointerEnterCapture={() => null}
                                                            onPointerLeaveCapture={() => null}
                                                            placeholder=""
                                                        >
                                                            {item.vaccine?.vaccine_Name}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue-gray"
                                                            className="font-normal"
                                                            onPointerEnterCapture={() => null}
                                                            onPointerLeaveCapture={() => null}
                                                            placeholder=""
                                                        >
                                                            {item.injection_Place?.name}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            variant="small"
                                                            color="blue-gray"
                                                            className="font-normal"
                                                            onPointerEnterCapture={() => null}
                                                            onPointerLeaveCapture={() => null}
                                                            placeholder=""
                                                        >
                                                            {item.injection_Number}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <div className="w-max">
                                                            <Chip
                                                                variant="ghost"
                                                                size="sm"
                                                                value={vaccinationStatusText[item.isVaccinated]}
                                                                color={item.isVaccinated == VaccinationResultStatus.Injected ? "green" : item.isVaccinated == VaccinationResultStatus.NotInjected ? "blue-gray" : "red"}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className={classes}>
                                                        <Tooltip content="View Detail">
                                                            <IconButton variant="text"
                                                                onPointerEnterCapture={() => null}
                                                                onPointerLeaveCapture={() => null}
                                                                placeholder=""
                                                            >
                                                                <Eye onClick={() => {
                                                                    setSelectedRow(item)
                                                                    handleOpen()
                                                                }} className="h-4 w-4" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                    {Array.from({ length: emptyRow }).map((_, index) => (
                                        <tr key={`empty-${index}`}>
                                            <td colSpan={TABLE_HEAD.length} className="p-6 text-center">
                                                &nbsp;
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardBody>


                        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4"
                            onPointerEnterCapture={() => null}
                            onPointerLeaveCapture={() => null}
                            placeholder=""
                        >
                            <Typography variant="small" color="blue-gray" className="font-normal"
                                onPointerEnterCapture={() => null}
                                onPointerLeaveCapture={() => null}
                                placeholder=""
                            >
                                Page {pageIndex} of {totalPages}
                            </Typography>
                            <div className="flex gap-2">
                                <Button
                                    placeholder=""
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                    variant="outlined" size="sm"
                                    disabled={pageIndex == 1}
                                    onClick={() => {
                                        const newIndex = pageIndex - 1;
                                        setPageIndex(newIndex)
                                    }}
                                >
                                    Previous
                                </Button>
                                <Button
                                    placeholder=""
                                    onPointerEnterCapture={() => { }}
                                    onPointerLeaveCapture={() => { }}
                                    variant="outlined" size="sm"
                                    disabled={pageIndex == totalPages}
                                    onClick={() => {
                                        const newIndex = pageIndex + 1;
                                        setPageIndex(newIndex)
                                    }}
                                >
                                    Next
                                </Button>
                            </div>
                        </CardFooter>
                        {open && (
                            <ViewDetailInjectionDialog
                                handleClose={handleClose}
                                handleCancelInjection={handleCancelInjection}
                                open={open}
                                result={selectedRow!}
                            />
                        )}
                    </>
                )}
        </Card>
    );
}