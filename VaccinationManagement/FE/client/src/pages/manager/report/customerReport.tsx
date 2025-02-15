import VaccinationResultService from '@/services/VaccinationResultService';
import VaccineTypeService from '@/services/VaccineTypeService';
import React, { useCallback, useEffect, useState } from 'react';
import CustomerService from '@/services/CustomerService';
import { CustomerReporting } from '@/types/user';
import CustomerStatistic from '@/components/layout/Report/CustomerStatistic';

const PAGE_SIZE = 5;
const CustomerReport = () => {
    const [displayType, setDisplayType] = useState('report');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [minYear, setInjectionMinYear] = useState();
    const [maxYear, setInjectionMaxYear] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [customers, setCustomers] = useState<CustomerReporting[]>([]);
    const [customerStatisticDisplay, setCustomerStatisticDisplay] = useState(false);


    const [filterParams, setFilterParams] = useState({
        fullName: '',
        fromDate: '',
        toDate: '',
        address: ''
    });

    const fetchCustomerReports = useCallback(async (
        page: number,
        pageSize = PAGE_SIZE,
        fullName?: string,
        fromDOB?: string,
        toDOB?: string,
        address?: string
    ) => {
        try {
            const data = await CustomerService.GetCustomersFilter(page, pageSize, fullName, fromDOB, toDOB, address);
            setCustomers(data.customers);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchCustomerReports(
            currentPage,
            5,
            filterParams.fromDate,
            filterParams.toDate,
            filterParams.fullName,
            filterParams.address
        );
    }, [currentPage, fetchCustomerReports, filterParams]);

    useEffect(() => {
        const fetchData = async () => {
            const vaccineType = await VaccineTypeService.GetPaginatedVaccineTypes();
            const rangeYear = await VaccinationResultService.GetRangeYear();
            setInjectionMinYear(rangeYear.minYear || '2024');
            setInjectionMaxYear(rangeYear.maxYear || '2024');
            setSelectedYear(maxYear || '2024');
            console.log(vaccineType.items);
        }
        fetchData();
    }, [maxYear])




    const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayType(e.target.value);
        setCustomerStatisticDisplay(false);
    };

    const years = minYear && maxYear
        ? Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i) : [];

    // const today = new Date();
    // const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        fromDate: "",
        toDate: "",
        fullName: '',
        address: '',
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    }

    const handleFilter = () => {
        setCurrentPage(1);
        setFilterParams(formData);
    };

    const handleReset = () => {
        const dateInputs = document.querySelectorAll('input[type="date"]') as NodeListOf<HTMLInputElement>;
        dateInputs.forEach(input => {
            input.value = '';
        });

        setFormData({
            fromDate: "",
            toDate: "",
            fullName: '',
            address: '',
        });
        setFilterParams({
            fromDate: "",
            toDate: "",
            fullName: '',
            address: '',
        });
        setCurrentPage(1);
    };

    return (
        <div className="p-6 bg-white shadow-md rounded-lg max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-4">REPORT CUSTOMER</h2>

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
                    <div className="flex items-center mr-4">
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
                {!customerStatisticDisplay && (
                    <>
                        {displayType === 'report' && (
                            <div className="flex items-center">
                                <label className="mr-2 font-medium">Date Of Birth:</label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2 mr-2"
                                    placeholder="From"
                                />
                                <input
                                    type="date"
                                    name="toDate"
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-md p-2"
                                    placeholder="To"
                                />
                            </div>
                        )}
                        {displayType === 'chart' && (
                            <div>
                                <label className="font-medium mr-2">Select year:</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className=" rounded-md p-2"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}

                                </select>
                            </div>
                        )
                        }
                    </>

                )}
            </div>
            {!customerStatisticDisplay ? (
                <>

                    {displayType === 'report' && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="font-medium">Full name:</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>

                            <div>
                                <label className="font-medium">Address:</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
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

                    {displayType === 'report' && (
                        <div>
                            <div className="mt-6">
                                <table className="w-full border-collapse border border-gray-300 text-sm text-left">
                                    <thead>
                                        <tr className="bg-green-500 text-white">
                                            <th className="border border-gray-300 p-2">No.</th>
                                            <th className="border border-gray-300 p-2">Full name</th>
                                            <th className="border border-gray-300 p-2">Date Of Birth</th>
                                            <th className="border border-gray-300 p-2">Address</th>
                                            <th className="border border-gray-300 p-2">Identity card</th>
                                            <th className="border border-gray-300 p-2">Num Of Inject</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {customers.map((item, index) => (
                                            <tr key={index} className="bg-white">
                                                <td className="border border-gray-300 p-2">{index + PAGE_SIZE * (currentPage - 1) + 1}</td>
                                                <td className="border border-gray-300 p-2">{item.full_Name}</td>
                                                <td className="border border-gray-300 p-2">{item.date_Of_Birth}</td>
                                                <td className="border border-gray-300 p-2">{item.address}</td>
                                                <td className="border border-gray-300 p-2">{item.identity_Card}</td>
                                                <td className="border border-gray-300 p-2">
                                                    {item.number_Of_Injection}
                                                </td>
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
                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <li key={index}>
                                                <button
                                                    onClick={() => handlePageChange(index + 1)}
                                                    className={`px-3 py-2 leading-tight border ${index + 1 === currentPage
                                                        ? 'bg-gray-500 text-white'
                                                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                                                        }`}
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
                    )}
                    {displayType === 'chart' && (
                        <CustomerStatistic selectedYear={selectedYear} />
                    )}

                </>)
                :
                <></>
            }


        </div>
    );
};

export default CustomerReport;



