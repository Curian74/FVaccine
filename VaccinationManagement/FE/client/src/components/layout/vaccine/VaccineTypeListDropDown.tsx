import VaccineTypeService from "@/services/VaccineTypeService";
import { VaccineType } from "@/types/vaccineType";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 100
const VaccineTypeList = () => {
    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
    const nav = useNavigate();
    const fetchNewsTypes = async () => {
        try {
            const data = await VaccineTypeService.GetPaginatedVaccineTypes(1, PAGE_SIZE, '', true);
            setVaccineTypes(data.items);
        } catch (err) {
            console.log(err);

        }
    };

    useEffect(() => {
        fetchNewsTypes();
    }, []);

    const handleToggleClick = (id: string) => {
        nav(`vaccineType/${id}`);
    };

    return (
        <ul
        className="absolute left-0 mt-2 bg-white text-gray-700 shadow-lg opacity-0 hidden
        group-hover:opacity-100 group-hover:block transition-all rounded-md w-80 max-h-80 overflow-y-auto">
        {vaccineTypes.map(vaccineType => (
            <li
                key={vaccineType.id}
                className="px-4 rounded-md w-[90%] mx-auto py-2 cursor-pointer hover:bg-gray-200 hover:text-black"
                onClick={() => {
                        handleToggleClick(vaccineType.id)
                    }}
                >
                    <p>{vaccineType.vaccine_Type_Name}</p>
                </li>
            ))}
        </ul>
    )
};

export default VaccineTypeList;