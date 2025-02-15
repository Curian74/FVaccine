import VaccineTypeService from '@/services/VaccineTypeService';
import { VaccineType } from '@/types/vaccineType';
import React, { useEffect, useState } from 'react';
import VaccineService from '@/services/VaccineService';
import { VaccineReport } from '@/types/vaccine';
import VaccineStatistic from '@/components/layout/Report/VaccineStatistic';

const PAGE_SIZE = 5;

const InjectionReport = () => {
    const [displayType, setDisplayType] = useState('report');
    const [selectedYear, setSelectedYear] = useState('2024');
    const [minYear, setInjectionMinYear] = useState();
    const [maxYear, setInjectionMaxYear] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [vaccineReport, setVaccineReport] = useState<VaccineReport[]>([]);
    const [vaccineType, setVaccineType] = useState<VaccineType[]>([]);
    const [isFiltering, setIsFiltering] = useState(false);

    const fetchVaccineResults = async (
        page: number,
        pageSize = PAGE_SIZE,
        fromDate?: string,
        toDate?: string,
        origin?: string,
        vaccineTypeId?: string
    ) => {
        try {
            const data = await VaccineService.GetVaccinesFilter(page, pageSize, fromDate, toDate, origin, vaccineTypeId);
            setVaccineReport(data.vaccines);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const vaccineType = await VaccineTypeService.GetAllVaccineTypes();
            setVaccineType(vaccineType);
            const rangeYear = await VaccineService.GetRangeYear();
            setInjectionMinYear(rangeYear.minYear);
            setInjectionMaxYear(rangeYear.maxYear);
            console.log(vaccineType);
        }
        fetchData();
    }, [])

    const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayType(e.target.value);
    };

    const years = minYear && maxYear
        ? Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i) : [];

    // const today = new Date();
    // const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    // const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        fromDate: '',
        toDate: '',
        origin: '',
        vaccineType: '',
    });

    const [tempFormData, setTempFormData] = useState({
        fromDate: '',
        toDate: '',
        origin: '',
        vaccineType: '',
    });

    const handleTempChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setTempFormData({ ...tempFormData, [e.target.name]: e.target.value });
    };


    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        if (isFiltering) fetchVaccineResults(newPage, PAGE_SIZE, formData.fromDate, formData.toDate, formData.origin, formData.vaccineType)
    }

    const handleReset = () => {
        const initialData = {
            fromDate: '',
            toDate: '',
            origin: '',
            vaccineType: '',
        };
        setFormData(initialData);
        setTempFormData(initialData);
        setCurrentPage(1);
        fetchVaccineResults(1, PAGE_SIZE);
        setIsFiltering(false);
    };

    const handleFilter = () => {
        setFormData(tempFormData);
        setIsFiltering(true);
        setCurrentPage(1);
        fetchVaccineResults(1, PAGE_SIZE, tempFormData.fromDate, tempFormData.toDate, tempFormData.origin, tempFormData.vaccineType);
    };

    useEffect(() => {
        if (!isFiltering) {
            fetchVaccineResults(currentPage);
        }
    }, [currentPage])

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
        <div className="p-6 bg-white shadow-md rounded-lg max-w-5xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-4">REPORT VACCINE</h2>

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
                        <label className="mr-2 font-medium">Next Injection Date:</label>
                        <input
                            type="date"
                            name="fromDate"
                            value={(tempFormData.fromDate)}
                            onChange={(e) => handleTempChange(e)}
                            className="border border-gray-300 rounded-md p-2 mr-2"
                            placeholder="From"
                        />
                        <input
                            type="date"
                            name="toDate"
                            value={(tempFormData.toDate)}
                            onChange={(e) => handleTempChange(e)}
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
                        <label className="font-medium">Origin:</label>
                        <input
                            type="text"
                            name="origin"
                            value={tempFormData.origin}
                            onChange={(e) => handleTempChange(e)}
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="font-medium">Vaccine type:</label>
                        <select
                            name="vaccineType"
                            value={tempFormData.vaccineType}
                            onChange={(e) => handleTempChange(e)}
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
                                    <th className="border border-gray-300 p-2">Vaccine Name</th>
                                    <th className="border border-gray-300 p-2">Vaccine Type</th>
                                    <th className="border border-gray-300 p-2">Num Of Inject</th>
                                    <th className="border border-gray-300 p-2">Begin Next Inject Date</th>
                                    <th className="border border-gray-300 p-2">End Next Inject Date</th>
                                    <th className="border border-gray-300 p-2">Origin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccineReport.map((item, index) => (
                                    <tr key={index} className="bg-white">
                                        <td className="border border-gray-300 p-2">{index + 1}</td>
                                        <td className="border border-gray-300 p-2">{item.vaccine_Name}</td>
                                        <td className="border border-gray-300 p-2">{item.vaccine_Type_Name}</td>
                                        <td className="border border-gray-300 p-2">{item.number_Of_Injection}</td>
                                        <td className="border border-gray-300 p-2">{item.time_Begin_Next_Injection}</td>
                                        <td className="border border-gray-300 p-2">{item.time_End_Next_Injection}</td>
                                        <td className="border border-gray-300 p-2">{item.origin}</td>
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
                                    <li key={index}>
                                        <button
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`px-3 py-2 leading-tight border border-gray-300 
                                                    ${currentPage === index + 1
                                                    ? 'text-white bg-gray-500'
                                                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                                                }`}
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
                <VaccineStatistic selectedYear={selectedYear}></VaccineStatistic>
            )}

        </div>

    );
};

export default InjectionReport;
