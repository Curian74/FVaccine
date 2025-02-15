import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, ChartData, BarElement } from 'chart.js';
import { DateMonth } from "@/helpers/constants/constants";
import { Search } from 'lucide-react';
import { cn } from '@/helpers/utils';
import UserImage from "@/assets/images/user_online.png";
import InjectionImage from "@/assets/images/injection.png";
import Income from "@/assets/images/income.png";
import { AnnualVaccineSummary, MonthlyVaccineSummary } from '@/types/report';
import ReportService from '@/services/ReportService';
import VaccineService from '@/services/VaccineService';
import { Vaccine } from '@/types/vaccine';
import "@/assets/styles/report/injectionReport.css";

ChartJS.register(CategoryScale, BarElement, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

type VaccineStatisticProps = {
    selectedYear: string
};
const PAGE_SIZE: number = 8;

const VaccineStatistic = ({ selectedYear }: VaccineStatisticProps) => {
    const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);
    const [keyword, setKeyword] = useState('');
    const [monthlySummary, setMonthlySummary] = useState<MonthlyVaccineSummary[]>([]);
    const [annualVaccine, setAnnualVaccine] = useState<AnnualVaccineSummary | null>(null);
    const [reportType, setReportType] = useState<"injection" | "income">("injection");

    const [chartData, setChartData] = useState<ChartData<'line'>>({
        labels: [],
        datasets: [
            {
                label: 'Total Injections',
                data: [],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    });

    const [barData, setBarData] = useState<ChartData<'bar'>>({
        labels: [],
        datasets: [
            {
                label: 'Total Income',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1,
            },
        ],
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(keyword);

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: selectedVaccine ? `Report of ${selectedVaccine.vaccine_Name}` : 'Vaccine Injection Report',
            },
            legend: {
                display: true,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Month',
                },
            },
            y: {
                title: {
                    display: true,
                },
            },
        },
    };

    const barOptions = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: selectedVaccine ? `Total Income of ${selectedVaccine.vaccine_Name}` : 'Total Vaccine Income Report',
            },
            legend: {
                display: true,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Month',
                },
            },
            y: {
                title: {
                    display: true,
                },
            },
        },
    };

    const handleReportTypeChange = (type: "injection" | "income") => {
        setReportType(type);
    };

    useEffect(() => {
        const fetchData = async () => {
            const monthSummary = await ReportService.GetMonthlyVaccineSummary(selectedYear, selectedVaccine?.id);
            setMonthlySummary(monthSummary);

            const annualVaccines = await ReportService.GetTotalCustomerUsingVaccine(selectedYear, selectedVaccine?.id);
            setAnnualVaccine(annualVaccines)
            console.log(monthSummary);
        };

        fetchData();
    }, [selectedYear, selectedVaccine]);


    const fetchVaccineReports = useCallback(async (
        page: number,
        keyword?: string,
    ) => {
        try {
            const data = await VaccineService.AllVaccines(page, PAGE_SIZE, keyword!);
            setVaccines(data.vaccines);
            setTotalPages(Math.ceil(data.totalVaccines / PAGE_SIZE));
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchVaccineReports(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchVaccineReports]);

    useEffect(() => {
        if (reportType === "injection") {
            setChartData({
                labels: monthlySummary.map((item) => DateMonth[item.month]),
                datasets: [
                    {
                        label: 'Total Injections',
                        data: monthlySummary.map((item) => item.totalInjections),
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                    },
                ],
            });
        } else if (reportType === "income") {
            setBarData({
                labels: monthlySummary.map((item) => DateMonth[item.month]),
                datasets: [
                    {
                        label: 'Total Income',
                        data: monthlySummary.map((item) => item.totalIncome),
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1,
                    },
                ],
            });
        }
    }, [monthlySummary, reportType]);

    const statistics = useMemo(() => {
        return [
            { label: "Total Customer Vaccinated", value: annualVaccine?.totalCustomers ?? 0, image: UserImage },
            { label: "Total Injection", value: annualVaccine?.totalInject ?? 0, image: InjectionImage },
            {
                label: "Total Annual Income ", value: annualVaccine?.totalIncome! > 0 ?
                    annualVaccine?.totalIncome.toLocaleString() + ' VNĐ' : 0 + ' VNĐ', image: Income
            },
        ];
    }, [annualVaccine]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(keyword);
        }, 200);
        return () => {
            clearTimeout(handler);
        };
    }, [keyword]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    }

    const renderPagination = () => {
        const pageNumbers = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 2) {
                pageNumbers.push(1, 2, 3, '...', totalPages);
            } else if (currentPage > totalPages - 2) {
                pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }

        return pageNumbers.map((pageNumber, index) => (
            <li key={index}>
                {pageNumber === '...' ? (
                    <button disabled className={`px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700`}>...</button>
                ) : (
                    <button
                        onClick={() => handlePageChange(pageNumber as number)}
                        className={`px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${currentPage === pageNumber ? 'bg-gray-500 text-white' : 'text-gray-500 bg-white'}`}
                    >
                        {pageNumber}
                    </button>
                )}
            </li>
        ));
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex">
                <div className="w-2/3 overflow-y-auto">
                    <div className="mt-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {statistics.map((stat, index) => (
                                <div
                                    key={index}
                                    className="p-5 rounded-lg shadow-md bg-gray-50 overflow-hidden"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 whitespace-nowrap">
                                            {stat.label}
                                        </span>
                                        <img src={stat.image} alt="Icon" className="w-6 h-6" />
                                    </div>
                                    <div className="mt-2">
                                        <span className="block text-2xl font-bold text-gray-800">
                                            {stat.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-1/3 p-4 ml-5 h-3/4 mt-5 overflow-y-auto rounded-lg shadow-md bg-gray-50">
                    {selectedVaccine ? (
                        <>
                            <h3 className="text-lg font-semibold mb-2 text-center">Vaccine Information</h3>
                            <p className='flex justify-between'><strong>ID:</strong> {selectedVaccine.id}</p>
                            <p className='flex justify-between'><strong>Name:</strong> {selectedVaccine.vaccine_Name}</p>
                            <p className='flex justify-between'><strong>Origin:</strong> {selectedVaccine.origin}</p>
                            <p className='flex justify-between'><strong>Vaccine Type:</strong> {selectedVaccine.vaccine_Name}</p>
                            {/* <p className='flex justify-between'><strong>Total Injections:</strong> {selectedVaccine.number_Of_Injection}</p> */}
                            <p className='flex justify-between'><strong>Purchase Price:</strong>{selectedVaccine.purchase_Price!.toLocaleString()} VNĐ</p>
                            <p className='flex justify-between'><strong>Selling Price:</strong>{selectedVaccine.selling_Price!.toLocaleString()} VNĐ</p>
                        </>
                    ) : (
                        <p>Please select a vaccine to view details.</p>
                    )}
                </div>
            </div>

            <div className="flex-1 flex mt-5">
                <div className="w-2/3 flex flex-col space-y-4">
                    <div className="radio-inputs w-full">
                        <label className="radio">
                            <input
                                type="radio"
                                name="radio"
                                checked={reportType === "injection"}
                                onChange={() => handleReportTypeChange("injection")}
                            />
                            <span className="name">Injection Report</span>
                        </label>
                        <label className="radio">
                            <input
                                type="radio"
                                name="radio"
                                checked={reportType === "income"}
                                onChange={() => handleReportTypeChange("income")}
                            />
                            <span className="name">Income Report</span>
                        </label>
                    </div>
                    <div className="rounded-lg h-full shadow-md bg-gray-50 overflow-hidden">
                        {reportType === "injection" ? (
                            <Line data={chartData} options={options} />
                        ) : (
                            <Bar data={barData} options={barOptions} />
                        )}
                    </div>

                </div>

                <div className="w-1/3 p-4 flex flex-col h-full ml-5 overflow-y-auto rounded-lg shadow-md bg-gray-50 overflow-hidden">
                    <div
                        className={cn(
                            "flex gap-x-2 bg-blue-gray-50 h-10 rounded-[1.25rem] z-20 items-center text-blue-gray-700",
                        )}>
                        <span className="ps-3">
                            <Search className="h-[1.18rem]" />
                        </span>
                        <div className="flex-1 text-sm">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search"
                                className="focus:outline-none bg-transparent w-full placeholder:font-light"
                                value={keyword}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <table className="w-full mt-3 border-collapse border border-gray-300 text-sm text-left">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="border border-gray-300 p-2">No.</th>
                                <th className="border border-gray-300 p-2">Full name</th>
                                <th className="border border-gray-300 p-2">Vaccine ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vaccines.map((item, index) => (
                                <tr key={index} className="bg-white cursor-pointer"
                                    onClick={() => setSelectedVaccine(item)}
                                >
                                    <td className="border border-gray-300 p-2">{index + (currentPage - 1) * PAGE_SIZE + 1}</td>
                                    <td className="border border-gray-300 p-2">{item.vaccine_Name}</td>
                                    <td className="border border-gray-300 p-2">
                                        {item.id}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='flex-grow'></div>
                    <div className='mt-4 flex justify-center'>
                        <nav>
                            <ul className='inline-flex items-center -space-x-px'>
                                <li>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className='px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700'
                                    >
                                        «
                                    </button>
                                </li>
                                {/* {Array.from({ length: totalPages }, (_, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`px-3 py-2 leading-tight border border-gray-300 ${currentPage === index + 1
                                                ? 'text-white bg-gray-500'
                                                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                                }`}                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))} */}
                                {renderPagination()}

                                <li>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className='px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700'
                                    >
                                        »
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VaccineStatistic;
