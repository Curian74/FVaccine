import React, { useCallback, useEffect, useState } from "react";
import VaccineImage from "@/assets/images/vaccineDefault.jpg"
import { useNavigate, useParams } from "react-router-dom";
import VaccineService from "@/services/VaccineService";
import { Vaccine } from "@/types/vaccine";
import Loading from "@/components/layout/Loading";
import Background from "@/assets/images/banner/vaccineBackground.jpg"
import { Search } from "lucide-react";
import VaccineTypeService from "@/services/VaccineTypeService";
import { VaccineType } from "@/types/vaccineType";
const PAGE_SIZE = 9

const baseUrl = import.meta.env.VITE_BASE_URL;

const VaccineByTypePage: React.FC = () => {
    const { vaccineTypeId } = useParams<{ vaccineTypeId: string }>();
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [vaccineType, setVaccineType] = useState<VaccineType>();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const nav = useNavigate();
    const handleClickVaccine = (vaccineId: string) => {
        nav(`/home/vaccine-detail/${vaccineId}`);
    }

    const fetchVaccines = useCallback(async (page: number) => {
        try {
            const data = await VaccineService.GetVaccineByVaccineTypeId(page, PAGE_SIZE, searchTerm, vaccineTypeId);
            setVaccines(data.vaccines);
            setTotalPages(Math.ceil(data.totalVaccines / PAGE_SIZE));
            console.log("Fetched vaccines:", data.vaccines);
            setIsLoading(false);
        } catch (err) {
            console.log(err);
        }
    }, [vaccineTypeId, searchTerm]);

    const fethcVaccineType = useCallback(async () => {
        try {
            const data = await VaccineTypeService.GetVaccineTypeById(vaccineTypeId!);
            setVaccineType(data);
            console.log("Fetched vaccine type:", data);
        } catch (err) {
            console.log(err);
        }
    }, [vaccineTypeId]);

    useEffect(() => {
        fetchVaccines(currentPage);
        fethcVaccineType();
    }, [currentPage, fetchVaccines, fethcVaccineType]);

    useEffect(() => {
        setCurrentPage(1);
    }, [vaccineTypeId])

    function formatCurrency(value: number) {
        return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }


    const handlePageChange = async (newPage: number) => {
        setCurrentPage(newPage);
        await fetchVaccines(newPage);
    };

    const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    if (isLoading) return <Loading />

    return (
        <div>
            <div className="relative w-full h-full">
                <img
                    src={Background}
                    alt="Vaccine Background"
                    className="w-full h-96 object-cover"
                />
                <div className="absolute flex flex-col gap-y-5 inset-0 w-full justify-center h-full items-center">
                    <h1 className="text-4xl font-bold text-white">{vaccineType?.vaccine_Type_Name}</h1>
                    {/* <div className="flex justify-center gap-x-4 w-full">
                        <div className="rounded-[1.25rem] border-[1.5px] h-10 w-1/5 justify-center flex items-center hover:bg-gradient-to-br from-orange-400 to-orange-800">
                            <button
                                className="uppercase font-bold text-lg text-white">
                                Vaccine By Vaccine Type
                            </button>
                        </div>
                        <div className="rounded-[1.25rem] border-[1.5px] h-10 w-1/5 justify-center flex items-center hover:bg-gradient-to-br from-orange-400 to-orange-800">
                            <button
                                className="uppercase font-bold text-lg text-white">
                                Vaccine By Age
                            </button>
                        </div>
                    </div> */}
                    <div
                        className="flex gap-x-2 bg-blue-gray-50 h-8 rounded-[1.25rem] z-20 items-center text-blue-gray-700 w-2/5"
                    >
                        <span className="ps-3">
                            <Search className="h-[1.18rem]" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search here..."
                            className="bg-transparent outline-none flex-grow truncate text-sm"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold text-blue-700 mb-4">Vaccine List</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {vaccines.map((vaccine) => (
                        <div
                            key={vaccine.id}
                            className="border rounded-lg shadow-md p-4 hover:shadow-lg cursor-pointer transition-shadow duration-200"
                            onClick={() => handleClickVaccine(vaccine.id)}
                        >
                            <img
                                src={vaccine.image ? baseUrl + vaccine.image : VaccineImage}
                                alt={vaccine.vaccine_Name}
                                className="w-full h-40 object-cover rounded-md mb-4"
                            />
                            <div>
                                <div className="flex justify-between">
                                    <h2 className="text-base font-bold text-blue-900">{vaccine.vaccine_Name} ({vaccine.origin})</h2>
                                    <div>
                                        <span className="text-black-600">Price:</span>
                                        <span className="text-red-600 font-bold"> {formatCurrency(Number(vaccine.selling_Price))}</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 mt-2">{vaccine.description.length > 100 ? `${vaccine.description.slice(0, 100)}...` : vaccine.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="my-5">
                <div className="flex justify-center">
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, index) => index + 1).reduce((pages, page) => {
                            if (totalPages > 4) {
                                if (page === 1 || page === totalPages || page === currentPage || Math.abs(page - currentPage) === 1) {
                                    pages.push(page);
                                } else if (
                                    (page === currentPage - 2 && currentPage > 3) ||
                                    (page === currentPage + 2 && currentPage < totalPages - 2)
                                ) {
                                    pages.push('...');
                                }
                            } else {
                                pages.push(page);
                            }
                            return pages;
                        }, [] as (number | string)[]).map((item, index) => (
                            <button
                                key={index}
                                className={`px-4 py-2 text-gray-700 rounded-full ${item === currentPage ? 'bg-blue-700 text-white' : ''
                                    }`}
                                onClick={() => typeof item === 'number' && handlePageChange(item)}
                                disabled={item === '...'}
                            >
                                {item}
                            </button>
                        ))}
                    </div>



                </div>
            </div>
        </div>

    );
};

export default VaccineByTypePage;
