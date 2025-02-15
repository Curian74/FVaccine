import VaccineTypeService from '@/services/VaccineTypeService';
import { VaccineType } from '@/types/vaccineType'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Checkbox, Icon, Loader } from 'semantic-ui-react';
import message from "@/helpers/constants/message.json";
import { RoleBasedRender } from '@/helpers/utils';
import { UserRole } from '@/types/userRole';

const VaccineTable: React.FC = () => {
    const [vaccines, setVaccines] = useState<VaccineType[]>([]);
    const [error, setError] = useState<string | null>();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVaccines, setSelectedVaccines] = useState<VaccineType[]>([]);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isConfirmAction, setComfirmAction] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isActive, setIsActive] = useState(true);
    const nav = useNavigate();
    const fetchVaccines = useCallback(async (pageIndex: number, searchTerm: string, isActive: boolean) => {
        try {
            const response = await VaccineTypeService.GetPaginatedVaccineTypes(pageIndex, entriesPerPage, searchTerm, isActive);
            setVaccines(response.items);
            console.log("List Vaccine Type: " + response.items);
            setTotalPages(response.totalPages);
            setTotalItems(response.totalItems);
        } catch (error) {
            console.error(error);
            setError('Failed to fetch vaccines.');
        }
    }, [entriesPerPage]);

    useEffect(() => {
        fetchVaccines(currentPage, debouncedSearchTerm, isActive);
    }, [currentPage, fetchVaccines, debouncedSearchTerm, isActive]);


    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 200);
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);
    const handleEntriesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setEntriesPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    }

    const handlePageChange = (newPage: number) => {
        setSelectedVaccines([]);
        setCurrentPage(newPage);
    }

    const handleSelectedAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedVaccines(displayVaccines);
        } else {
            setSelectedVaccines([]);
        }
    }

    const handleConfirmAction = async () => {
        try {
            const updatedVaccines = selectedVaccines.map((vaccine) => ({
                ...vaccine,
                status: !vaccine.status,
            }));

            await VaccineTypeService.MakeInactiveVaccineType(updatedVaccines);

            setVaccines((prev) =>
                prev.filter((vaccine) =>
                    !updatedVaccines.some((updated) => updated.id === vaccine.id)
                )
            );
            setSelectedVaccines([]);
        } catch (e) {
            console.error(e);
        }
        handleClose();
    };

    const handleToggleStatus = async () => {
        if (selectedVaccines.length == 0) {
            setPopupMessage(message["MSG 36"]);
            setPopupVisible(true);
            return;
        }
        setPopupMessage(isActive ? message["MSG 34"] : message["MSG 39"]);
        setPopupVisible(true);
        setComfirmAction(true);
    }

    const handleClose = () => {
        setPopupVisible(false);
        setComfirmAction(false);
    }


    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    }

    const handleUpdate = () => {
        if (selectedVaccines.length > 1 || selectedVaccines.length == 0) {
            setPopupMessage(message["MSG 35"]);
            setPopupVisible(true);
            return;
        }
        const id = selectedVaccines[0].id;
        nav(`/updateVaccineType/${id}`)
    }
    const handleToggleClick = () => {
        setSelectedVaccines([]);
        setIsActive(!isActive);
        setCurrentPage(1);
    }

    useEffect(() => {
        console.log(selectedVaccines);
    }, [selectedVaccines])

    const handleCheckboxChange = (vaccineType: VaccineType) => {
        setSelectedVaccines((prev) =>
            prev.includes(vaccineType) ? prev.filter((vaccine) => vaccine !== vaccineType) : [...prev, vaccineType])
    }

    const displayVaccines = vaccines;

    const startIndex = (currentPage - 1) * entriesPerPage + 1;
    const endIndex = (startIndex + entriesPerPage) > totalItems ? totalItems : startIndex + entriesPerPage - 1; 

    if (!vaccines) {
        return <Loader active inline="centered"></Loader>
    }

    if (error) {
        return <div>Error: {error}</div>
    }
    return (
        <div className='p-4'>
            <h1 className='text-center text-2xl font-bold mb-4'>Vaccine Type List</h1>
            <div className='bg-white p-4 rounded-lg shadow'>
                <div className="flex justify-between mb-2">
                    <div>
                        <label htmlFor="entries" className="mr-2">Show</label>
                        <select
                            name="entries"
                            className="border rounded p-1"
                            onChange={handleEntriesChange}
                            value={entriesPerPage}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select> entries
                    </div>

                    <div className="flex items-center space-x-4">
                        <Checkbox
                            toggle
                            onClick={handleToggleClick}
                            label={'Active'}
                            checked={isActive}
                        />
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search"
                                className="border p-1 pl-8 rounded w-full"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            <Icon name="search" className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>


                    </div>
                </div>

                <table className='min-w-full border-collapse table-auto'>
                    <thead>
                        <tr className='bg-green-600 text-white'>
                            <th className='boder p-2 text-left'><input type="checkbox"
                                checked={selectedVaccines.length === displayVaccines.length && displayVaccines.length > 0}
                                onChange={handleSelectedAll}
                            /></th>
                            <th className='boder p-2 text-left'>Code</th>
                            <th className='boder p-2 text-left'>VaccineType Name</th>
                            <th className='boder p-2 text-left'>Description</th>
                            <th className='boder p-2 text-left'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayVaccines.map((item, index) => (
                            <tr key={index} className='odd:bg-gray-100 even:bg-white'>
                                <td className='boder p-2'> <input type="checkbox"
                                    checked={selectedVaccines.includes(item)}
                                    onChange={() => handleCheckboxChange(item)}
                                /></td>
                                <td className='boder p-2'>{item.id}</td>
                                <td className='boder p-2'>{item.vaccine_Type_Name}</td>
                                <td className='boder p-2'>{item.description}</td>
                                <td className='boder p-2'>{item.status ? "Active" : "Inactive"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='flex justify-between items-center mt-4'>
                    <div>
                        Showing {startIndex} to {endIndex } of {totalItems } entries
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
                                            className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${currentPage === index + 1 ? 'bg-gray-200' : ''}`}
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

                <div className='flex items-center'>

                <RoleBasedRender render={(role) =>
                  (role == UserRole.Admin) ?
                    <>
                      <button className='px-4 py-2 bg-blue-500 text-white rounded mr-2' onClick={() => nav("/addVaccineType")}>
                          New Vaccine Type
                      </button>
                      <button
                          onClick={handleToggleStatus}
                          className='px-4 py-2 bg-red-500 text-white rounded mr-2'>
                          {isActive ? 'Make Inactive' : 'Make Active'}
                      </button>
                      <button
                          onClick={handleUpdate}
                          className='px-4 py-2 bg-orange-500 text-white rounded mr-2'>
                          Update Vaccine Type
                      </button>
                    </>
                    :
                    null
                  }
                  defaultRender={(error) =>
                    <p className="text-red-500"> {error} </p>
                  }
                />

                </div>

            </div>

            {isPopupVisible && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p>{popupMessage}</p>
                        <div className="mt-4 flex justify-end">
                            {isConfirmAction ? (
                                <>
                                    <button
                                        className="px-4 py-2 bg-green-500 text-white rounded mr-2"
                                        onClick={handleConfirmAction}
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


        </div>

    )
}

export default VaccineTable
