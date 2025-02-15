import VaccinationResultService from '@/services/VaccinationResultService';
import VaccineTypeService from '@/services/VaccineTypeService';
import { VaccinationResult } from '@/types/vaccinationResult';
import { VaccineType } from '@/types/vaccineType';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, ChartData } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { MonthlyInjectionSummary, VaccineStatisticByYear } from '@/types/report';
import ReportService from '@/services/ReportService';
import { DateMonth } from '@/helpers/constants/constants';
import UserImage from "@/assets/images/user_online.png";
import InjectionImage from "@/assets/images/injection.png";
import VaccineImage from "@/assets/images/vaccine.png";
import Income from "@/assets/images/income.png";
import "@/assets/styles/report/injectionReport.css";
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const InjectionReport = () => {
    const [displayType, setDisplayType] = useState('report');
    const [reportType, setReportType] = useState<"injection" | "revenue">("injection");
    const [selectedYear, setSelectedYear] = useState('2024');
    const [minYear, setInjectionMinYear] = useState();
    const [maxYear, setInjectionMaxYear] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [vaccineResult, setVaccineResult] = useState<VaccinationResult[]>([]);
    const [monthlySummary, setMonthlySummary] = useState<MonthlyInjectionSummary[]>([]);
    const [vaccineType, setVaccineType] = useState<VaccineType[]>([]);
    const [annualVaccine, setAnnualVaccine] = useState<VaccineStatisticByYear[]>([]);
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
    const fetchVaccineResults = useCallback(async (
        page: number,
        pageSize = 5,
        fromDate?: string,
        toDate?: string,
        prevention?: string,
        vaccineTypeId?: string
    ) => {
        try {
            const data = await VaccinationResultService.GetVaccinationResultsFilter(page, pageSize, fromDate, toDate, prevention, vaccineTypeId);
            setVaccineResult(data.injection_Results);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const vaccineType = await VaccineTypeService.GetAllVaccineTypes();
            setVaccineType(vaccineType);
            const rangeYear = await VaccinationResultService.GetRangeYear();
            setInjectionMinYear(rangeYear.minYear || '2024');
            setInjectionMaxYear(rangeYear.maxYear || '2024');
            setSelectedYear(maxYear || '2024');
            console.log(vaccineType);
        }
        fetchData();
    }, [maxYear])

    useEffect(() => {
        fetchVaccineResults(currentPage);
    }, []);

    // useEffect(() => {
    //     fetchVaccineResults(currentPage);
    // }, [currentPage, fetchVaccineResults]);

    useEffect(() => {
        const fetchData = async () => {
            const monthSummary = await ReportService.GetMonthlyInjectionSummary(selectedYear);
            console.log(monthSummary);
            setMonthlySummary(monthSummary);
            const annualVaccines = await ReportService.GetVaccineStatisticByYear(selectedYear);
            setAnnualVaccine(annualVaccines)
        };

        fetchData();
    }, [selectedYear, maxYear]);
    useEffect(() => {
        if (reportType === "injection") {
            setChartData({
                labels: monthlySummary.map((item) => DateMonth[item.month]),
                datasets: [
                    {
                        label: "Total Injections",
                        data: monthlySummary.map((item) => item.totalInjections),
                        fill: false,
                        borderColor: "rgb(75, 192, 192)",
                        tension: 0.1,
                    },
                ],
            });
        } else if (reportType === "revenue") {
            setChartData({
                labels: monthlySummary.map((item) => DateMonth[item.month]),
                datasets: [
                    {
                        label: "Total Revenue",
                        data: monthlySummary.map((item) => item.totalRevenue),
                        fill: false,
                        borderColor: "rgb(255, 99, 132)",
                        tension: 0.1,
                    },
                ],
            });
        }
        const totalInjections = annualVaccine.reduce((arr, val) => arr + val.totalInjects, 0);
        setAnnualVaccineData({
            labels: annualVaccine.map((item) => item.vaccineName + ': ' + item.totalInjects),
            datasets: [{
                data: annualVaccine.map((item) => (item.totalInjects / totalInjections) * 100),
                backgroundColor: annualVaccine.map(() => getRandomColor()),
            }],
        });
    }, [monthlySummary, annualVaccine, reportType]);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayType(e.target.value);
    };
    const handleReportTypeChange = (type: "injection" | "revenue") => {
        setReportType(type);
    };

    const years = minYear && maxYear
        ? Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i) : [];

    //const today = new Date();
    //const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    //const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        fromDate: '',
        toDate: '',
        prevention: '',
        vaccineType: '',
    });

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: reportType === "injection" ? "Injection Report" : "Revenue Report",
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

    const totalInjections = monthlySummary.reduce((sum, item) => sum + item.totalInjections, 0);
    const totalVisits = monthlySummary.reduce((sum, item) => sum + item.totalNumberVisits, 0);
    const totalRevenue = useMemo(
        () => monthlySummary.reduce((sum, item) => sum + item.totalRevenue, 0),
        [monthlySummary]
    );
    const statistics = useMemo(() => [
        { label: "Total Customer Visits", value: totalVisits, image: UserImage },
        { label: "Total Injection", value: totalInjections, image: InjectionImage },
        { label: "Total Vaccine", value: annualVaccine.length, image: VaccineImage },
        { 
            label: "Total Revenue", 
            value: `${totalRevenue.toLocaleString()} VNĐ`,
            image: Income 
        },
    ], [totalInjections, annualVaccine, totalVisits, totalRevenue]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        fetchVaccineResults(newPage, 5, formData.fromDate, formData.toDate, formData.prevention, formData.vaccineType);
    }

    const renderPagination = () => {
        //const totalPages = Math.ceil(totalEntries / pageSize);
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

    const handleReset = () => {
        setFormData({
            fromDate: '',
            toDate: '',
            prevention: '',
            vaccineType: '',
        });
        setCurrentPage(1);
        fetchVaccineResults(1);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchVaccineResults(1, 5, formData.fromDate, formData.toDate, formData.prevention, formData.vaccineType);
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-4">REPORT INJECTION RESULT</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                    <label className="mr-4 font-medium">Display Type:</label>
                    <div className="flex items-center mr-4">
                        <input
                            type="radio"
                            id="report"
                            name="displayType"
                            value="report"
                            checked={displayType === 'report'}
                            onChange={handleDisplayChange}
                            className="mr-2"
                        />
                        <label htmlFor="report">Report</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="chart"
                            name="displayType"
                            value="chart"
                            checked={displayType === 'chart'}
                            onChange={handleDisplayChange}
                            className="mr-2"
                        />
                        <label htmlFor="chart">Chart</label>
                    </div>
                </div>

                {displayType === 'report' ? (
                    <div className="flex items-center">
                        <label className="mr-2 font-medium">Inject Date:</label>
                        <input
                            type="date"
                            name="fromDate"
                            value={(formData.fromDate)}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md p-2 mr-2"
                            placeholder="From"
                        />
                        <input
                            type="date"
                            name="toDate"
                            value={(formData.toDate)}
                            onChange={handleChange}
                            className="border border-gray-300 rounded-md p-2"
                            placeholder="To"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="font-medium mr-2">Select year:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-gray-300 rounded-md p-2"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}

                        </select>
                    </div>
                )}
            </div>

            {displayType === 'report' && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="font-medium">Search:</label>
                        <input
                            type="text"
                            name="prevention"
                            value={formData.prevention}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="font-medium">Vaccine type:</label>
                        <select
                            name="vaccineType"
                            value={formData.vaccineType}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2"
                        >
                            <option value="">-- Select Vaccine --</option>
                            {vaccineType && vaccineType.length > 0 && vaccineType.map((item, index) => (
                                <option key={index} value={item.id}>{item.vaccine_Type_Name}</option>
                            ))}

                        </select>
                    </div>

                    <div className="flex justify-end gap-4 items-end">
                        <button
                            onClick={handleReset}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleFilter}
                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                            Filter
                        </button>
                    </div>
                </div>
            )}

            {displayType === 'report' ? (
                <div>
                    <div className="mt-6">
                        <table className="w-full border-collapse border border-gray-300 text-sm text-left">
                            <thead>
                                <tr className="bg-green-500 text-white">
                                    <th className="border border-gray-300 p-2">No.</th>
                                    <th className="border border-gray-300 p-2">Vaccine</th>
                                    <th className="border border-gray-300 p-2">Prevention</th>
                                    <th className="border border-gray-300 p-2">Customer name</th>
                                    <th className="border border-gray-300 p-2">Date of Inject</th>
                                    <th className="border border-gray-300 p-2">Num Of Inject</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccineResult.map((item, index) => (
                                    <tr key={index} className="bg-white">
                                        <td className="border border-gray-300 p-2">{index + 1}</td>
                                        <td className="border border-gray-300 p-2">{item.vaccine?.vaccine_Name}</td>
                                        <td className="border border-gray-300 p-2">{item.prevention}</td>
                                        <td className="border border-gray-300 p-2">{item.customer?.full_Name}</td>
                                        <td className="border border-gray-300 p-2">{item.injection_Date}</td>
                                        <td className="border border-gray-300 p-2">{item.number_Of_Injection}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='mt-4 flex justify-end'>
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
                                    <li>
                                        <button
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 `}
                                        >
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
            ) : (
                <div>
                    <h3 className="text-lg font-semibold mb-4">REPORT INJECTION CHART</h3>
                    <div className="mt-6">

                        <div className="grid grid-cols-4 gap-4 mb-4">
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
                                checked={reportType === "revenue"}
                                onChange={() => handleReportTypeChange("revenue")}
                            />
                            <span className="name">Revenue Report</span>
                        </label>
                    </div>
                    <Line data={chartData} options={options} />
                    <div className="p-4 flex flex-col h-full ml-3 mt-5 overflow-y-auto rounded-lg shadow-md bg-gray-50 overflow-hidden">
                        <h1 className='text-center font-semibold mb-3'>Statistics on the number of vaccines used in {selectedYear}</h1>
                        <div className="flex justify-center">
                            <div className=" flex justify-center items-center">
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
                            <div className="flex flex-wrap justify-start items-start pl-4">
                                {Array.from({ length: Math.ceil(annualVaccineData.labels.length / 5) }).map((_, colIndex) => (
                                    <div key={colIndex} className="flex flex-col mr-8">
                                        {annualVaccineData.labels
                                            .slice(colIndex * 5, colIndex * 5 + 5)
                                            .map((label, index) => (
                                                <div key={index} className="flex items-center mb-2">
                                                    <span
                                                        className="inline-block w-4 h-4 mr-2"
                                                        style={{ backgroundColor: annualVaccineData.datasets[0].backgroundColor[colIndex * 5 + index] }}
                                                    ></span>
                                                    <p>{label}</p>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

            )}

        </div>

    );
};

export default InjectionReport;
