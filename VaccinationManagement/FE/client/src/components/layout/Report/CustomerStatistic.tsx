import { useCallback, useEffect, useMemo, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, ChartData } from 'chart.js';
import { DateMonth } from "@/helpers/constants/constants";
import { MonthlyCustomerSummary } from '@/types/report';
import { CustomerReporting } from '@/types/user';
import { Search } from 'lucide-react';
import { cn } from '@/helpers/utils';
import UserImage from "@/assets/images/user_online.png";
import InjectionImage from "@/assets/images/injection.png";
import VaccineImage from "@/assets/images/vaccine.png";
import CustomerService from '@/services/CustomerService';
import { AnnualVaccineCustomer } from '@/types/report';
import ReportService from '@/services/ReportService';
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

type CustomerStatisticProps = {
    selectedYear: string
};
const PAGE_SIZE: number = 8;

const CustomerStatistic = ({ selectedYear }: CustomerStatisticProps) => {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerReporting | null>(null);
    const [keyword, setKeyword] = useState('');
    const [monthlySummary, setMonthlySummary] = useState<MonthlyCustomerSummary[]>([]);
    const [annualVaccine, setAnnualVaccine] = useState<AnnualVaccineCustomer[]>([]);
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
    const [annualVaccineData, setAnnualVaccineData] = useState({
        labels: ['Banana', 'Orange', 'Blueberry'],
        datasets: [{ data: [30, 50, 20], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }],
    })
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [customers, setCustomers] = useState<CustomerReporting[]>([]);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(keyword);

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: selectedCustomer ? `Report of ${selectedCustomer.full_Name}` : 'Customer Injection Report',
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

    useEffect(() => {
        const fetchData = async () => {
            const monthSummary = await ReportService.GetMonthlyCustomerSummary(selectedYear, selectedCustomer?.id);
            setMonthlySummary(monthSummary);

            const annualVaccines = await ReportService.GetAnnualVaccines(selectedYear, selectedCustomer?.id);
            setAnnualVaccine(annualVaccines)
            console.log(monthSummary);
        };

        fetchData();
    }, [selectedYear, selectedCustomer]);


    const fetchCustomerReports = useCallback(async (
        page: number,
        FullName?: string,
    ) => {
        try {
            const data = await CustomerService.GetCustomersFilter(page, PAGE_SIZE, undefined, undefined, FullName);
            setCustomers(data.customers);   
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
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
        const totalInjections = annualVaccine.reduce((arr, val) => arr + val.totalInject, 0);
        setAnnualVaccineData({
            labels: annualVaccine.map((item) => item.vaccineName + ': ' + item.totalInject),
            datasets: [{
                data: annualVaccine.map((item) => (item.totalInject/totalInjections) * 100),
                backgroundColor: annualVaccine.map(() => getRandomColor()),
            }],
        });
    }, [monthlySummary, annualVaccine]);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const totalInjections = monthlySummary.reduce((acc, item) => acc + item.totalInjections, 0);

    const statistics = useMemo(() => [
        { label: "Total Number Visits", value: annualVaccine[0] ? annualVaccine[0].totalInjectionVisits : 0, image: UserImage },
        { label: "Total Injection", value: totalInjections, image: InjectionImage },
        { label: "Total Vaccine", value: annualVaccine.length, image: VaccineImage },
    ], [totalInjections, annualVaccine]);

    useEffect(() => {
        fetchCustomerReports(currentPage, debouncedSearchTerm);
    }, [currentPage, debouncedSearchTerm, fetchCustomerReports]);

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



    return (
        <div className="h-screen flex flex-col">
            <div className="flex">
                <div className="w-2/3 overflow-y-auto">
                    <div className="mt-6">

                        <div className="grid grid-cols-3 gap-4 mb-4">
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


                <div className="w-1/3 p-4 ml-3 overflow-y-auto rounded-lg shadow-md bg-gray-50">
                    {selectedCustomer ? (
                        <>
                            <h3 className="text-lg font-semibold mb-2 text-center">Customer Information</h3>
                            <p className='flex justify-between'><strong>ID:</strong> {selectedCustomer.id}</p>
                            <p className='flex justify-between'><strong>Name:</strong> {selectedCustomer.full_Name}</p>
                            <p className='flex justify-between'><strong>Address:</strong> {selectedCustomer.address}</p>
                            <p className='flex justify-between'><strong>Date of Birth:</strong> {selectedCustomer.date_Of_Birth}</p>
                            <p className='flex justify-between'><strong>Total Injections:</strong> {selectedCustomer.number_Of_Injection}</p>
                        </>
                    ) : (
                        <p>Please select a customer to view details.</p>
                    )}
                </div>
            </div>

            <div className="flex-1 flex mt-5">

                <div className="w-2/3 rounded-lg shadow-md bg-gray-50 overflow-hidden">
                    <Line data={chartData} options={options} />
                    <div className="flex max-h-48">
                        <div className="w-1/2 flex justify-center items-center">
                            <Doughnut data={annualVaccineData} options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                }
                            }}
                            />
                        </div>
                        <div className="w-1/2 flex flex-col justify-center items-start pl-4">
                            {annualVaccineData.labels.map((label, index) => (
                                <div key={index} className="flex items-center mb-2">
                                    <span
                                        className="inline-block w-4 h-4 mr-2"
                                        style={{ backgroundColor: annualVaccineData.datasets[0].backgroundColor[index] }}
                                    ></span>
                                    <p>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                <div className="w-1/3 p-4 flex flex-col h-full ml-3 overflow-y-auto rounded-lg shadow-md bg-gray-50 overflow-hidden">
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
                            <tr className="bg-green-500 text-white"
                            >
                                <th className="border border-gray-300 p-2">No.</th>
                                <th className="border border-gray-300 p-2">Full name</th>
                                <th className="border border-gray-300 p-2">Identity Card</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((item, index) => (
                                <tr key={index} className="bg-white cursor-pointer"
                                    onClick={() => setSelectedCustomer(item)}

                                >
                                    <td className="border border-gray-300 p-2">{index + (currentPage - 1) * PAGE_SIZE + 1}</td>
                                    <td className="border border-gray-300 p-2">{item.full_Name}</td>
                                    <td className="border border-gray-300 p-2">
                                        {item.identity_Card}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='flex-grow'></div>
                    <div className='mt-4 flex justify-end '>
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
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <li>
                                        <button
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 `}
                                        >
                                            {index + 1}
                                        </button>
                                    </li>
                                ))}
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

export default CustomerStatistic;
