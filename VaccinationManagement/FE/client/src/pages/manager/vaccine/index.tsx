import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import VaccineService from '@/services/VaccineService';
import { Vaccine } from '@/types/vaccine';
import { Checkbox } from 'semantic-ui-react';
import message from '@/helpers/constants/message.json';
import { RoleBasedRender } from '@/helpers/utils';
import { UserRole } from '@/types/userRole';

const ListVaccine = () => {
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [selectVaccines, setSelectVaccines] = useState<Vaccine[]>([]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalEntries, setTotalEntries] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [isPopupVisible, setPopupVisible] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [isConfirmAction, setComfirmAction] = useState(false);

    const navigate = useNavigate();

    // Fetch vaccines with pagination and filtering using AJAX
    const fetchVaccines = async (page: number, pageSize: number, searchTerm: string) => {
        try {
            const data = await VaccineService.GetVaccines(page, pageSize, searchTerm, isActive);
            setVaccines(data.vaccines);
            setSelectVaccines([]);
            setTotalEntries(data.totalVaccines);
            setLoading(false);
        } catch (err) {
            setError('Failed to load vaccine data');
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch vaccines whenever page, pageSize, or searchTerm changes
        fetchVaccines(page, pageSize, searchTerm);
    }, [page, pageSize, searchTerm, isActive]);

    const handlePageChange = async (newPage: number) => {
        setPage(newPage);
        await fetchVaccines(newPage, pageSize, searchTerm);
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(totalEntries / pageSize);
        const pageNumbers = [];
    
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (page <= 2) {
                pageNumbers.push(1, 2, 3, '...', totalPages);
            } else if (page > totalPages - 2) {
                pageNumbers.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(1, '...', page - 1, page, page + 1, '...', totalPages);
            }
        }
    
        return pageNumbers.map((pageNumber, index) => (
            <li key={index}>
                {pageNumber === '...' ? (
                    <button disabled className={`px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700`}>...</button>
                ) : (
                    <button
                        onClick={() => handlePageChange(pageNumber as number)}
                        className={`px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${page === pageNumber ? 'bg-gray-500 text-white' : 'text-gray-500 bg-white'}`}
                    >
                        {pageNumber}
                    </button>
                )}
            </li>
        ));
    };

    const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);
        await fetchVaccines(1, pageSize, event.target.value);
    };

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectVaccines(vaccines);
        } else {
            setSelectVaccines([]);
        }
    };

    const handleUpdateVaccine = (vaccine: Vaccine) => {
        if (selectVaccines.length === 0) {
            setPopupMessage(message["MSG 36"]);
            setPopupVisible(true);
            return;
        }
        if (selectVaccines.length > 1) {
            setPopupMessage(message["MSG 35"]);
            setPopupVisible(true);
            return;
        }
        navigate('/vaccine/update', { state: { vaccine } });
    };

    const handleMakeInactive = async () => {
        try {
            const selectedVaccineIds = selectVaccines.map(vaccine => vaccine.id);

            // Call the API to mark vaccines as inactive
            await VaccineService.MakeVaccinesInactive(selectedVaccineIds);
            setSelectVaccines([]);

            // Refresh the vaccine list after status update using current pagination and filter
            fetchVaccines(page, pageSize, searchTerm);
            handleClose();
        } catch (err) {
            console.error("Failed to update vaccines", err);
            setError("Failed to update vaccine status");
        }
    };

    const handleToggleStatus = async () => {
        if (selectVaccines.length === 0) {
            setPopupMessage(message["MSG 36"]);
            setPopupVisible(true);
            return;
        }
        setPopupMessage(message["MSG 42"]);
        setPopupVisible(true);
        setComfirmAction(true);
    };

    const handleToggleClick = () => {
        setIsActive(!isActive);
        setSelectVaccines([]);
        setPage(1);
    }

    const handleClose = () => {
        setPopupVisible(false);
        setComfirmAction(false);
    };

    //const totalPages = Math.ceil(totalEntries / pageSize);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex justify-center">
            <div className="bg-white w-full m-px-10 p-4">
                <div className="pb-4">
                    <h1 className="text-center text-2xl font-semibold">VACCINE LIST</h1>
                </div>
                <div className="p-4 shadow-md rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                            <label className="mr-2">Show</label>
                            <select
                                className="border rounded p-1"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(parseInt(e.target.value))
                                    setPage(1);
                                }}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                            </select>
                            <label className="ml-2">entries</label>
                        </div>
                        <div className='flex items-center'>
                            <label className='mr-4'>{isActive ? 'Active' : 'Inactive'}</label>
                            <Checkbox
                                toggle
                                onClick={handleToggleClick}
                                checked={isActive}
                            />

                            <input
                                type="text"
                                placeholder='Search'
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="border rounded p-1 ml-14"
                            />
                        </div>
                    </div>
                    <table className="min-w-full bg-white table-fixed">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                <th className="py-2 border-b">
                                    <input type="checkbox"
                                        checked={selectVaccines.length === vaccines.length && vaccines.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-2 px-4 border-b">Vaccine id</th>
                                <th className="py-2 px-4 border-b">Vaccine name</th>
                                <th className="py-2 px-4 border-b">Vaccine type</th>
                                <th className="py-2 px-4 border-b">Number of injections</th>
                                <th className="py-2 px-4 border-b">Origin</th>
                                <th className="py-2 px-4 border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vaccines.map((vaccine: any) => (
                                <tr key={vaccine.id} className="odd:bg-gray-100 even:bg-white">
                                    <td className="py-2 px-4 pl-4 border-b">
                                        <input type="checkbox"
                                            checked={Array.isArray(selectVaccines) && selectVaccines.includes(vaccine)}
                                            onChange={() => {
                                                if (selectVaccines.includes(vaccine)) {
                                                    setSelectVaccines(selectVaccines.filter(v => v !== vaccine));
                                                } else {
                                                    setSelectVaccines([...selectVaccines, vaccine]);
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="py-2 px-4 border-b">{vaccine.id}</td>
                                    <td className="py-2 px-4 border-b">{vaccine.vaccine_Name}</td>
                                    <td className="py-2 px-4 border-b">{vaccine.vaccine_Type?.vaccine_Type_Name}</td>
                                    <td className="py-2 px-4 border-b">{vaccine.number_Of_Injection}</td>
                                    <td className="py-2 px-4 border-b">{vaccine.origin}</td>
                                    <td className="py-2 px-4 border-b">{vaccine.status ? 'Active' : 'Inactive'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="items-center mt-4">
                        <div className="flex justify-between items-center mt-4">
                            <div>Showing {pageSize * (page - 1) + Math.min(totalEntries,1)} to {Math.min(totalEntries,pageSize * page)} of {totalEntries} entries</div>

                            <div className='mt-4 flex justify-end'>
                                <nav>
                                    <ul className='inline-flex items-center -space-x-px'>
                                        <li>
                                            <button
                                                onClick={() => handlePageChange(page - 1)}
                                                disabled={page === 1}
                                                className='px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700'
                                            >
                                                «
                                            </button>
                                        </li>
                                        {/* {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                                            <li key={pageNumber}>
                                                <button
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${page === pageNumber ? 'bg-gray-500 text-white' : 'text-gray-500 bg-white'}`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            </li>
                                        ))} */}
                                        {renderPagination()}
                                        <li>
                                            <button
                                                onClick={() => handlePageChange(page + 1)}
                                                disabled={page * pageSize >= totalEntries}
                                                className='px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700'
                                            >
                                                »
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                        </div>
                        <div className="flex items-center mt-4">

                        <RoleBasedRender render={(role) =>
                          (role == UserRole.Admin) ?
                            <>
                              <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2 shadow-xl" onClick={() => { navigate('/vaccine/add') }}>New Vaccine</button>
                              <button className="bg-red-500 text-white px-4 py-2 rounded mr-2 shadow-xl" onClick={() => handleUpdateVaccine(selectVaccines[0])}>Update Vaccine</button>
                              <button className="bg-orange-500 text-white px-4 py-2 rounded mr-2 shadow-xl" onClick={handleToggleStatus}>Make {isActive ? 'Inactive' : 'Active'}</button>
                              <button className="bg-green-500 text-white px-4 py-2 rounded mr-2 shadow-xl" onClick={() => { navigate('/vaccine/import') }}>Import Vaccine</button>
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
                </div>
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
                                        onClick={handleMakeInactive}
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
    );
};

export default ListVaccine;
