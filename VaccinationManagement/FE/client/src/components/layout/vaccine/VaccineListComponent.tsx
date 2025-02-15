import React, { useCallback, useEffect, useState } from "react";
import VaccineImage from "@/assets/images/vaccineDefault.jpg"
import { useNavigate } from "react-router-dom";
import VaccineService from "@/services/VaccineService";
import { Vaccine } from "@/types/vaccine";

const PAGE_SIZE = 8

interface VaccineListComponentProps {
  onLoadComplete: () => void;
}

const baseUrl = import.meta.env.VITE_BASE_URL;

const VaccineListComponent: React.FC<VaccineListComponentProps> = ({ onLoadComplete }) => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  // const [page, setPage] = useState(1);
  const nav = useNavigate();
  const handleClickVaccine = (vaccineId: string) => {
    nav(`vaccine-detail/${vaccineId}`);
  }

  const fetchVaccines = useCallback(async (page: number) => {
    try {
      const data = await VaccineService.GetVaccines(page, PAGE_SIZE, '', true);
      setVaccines(data.vaccines);
      console.log("Fetched vaccines:", data.vaccines);
      if (data.vaccines.length > 0) {
        console.log("onLoadComplete called");
        onLoadComplete();
      }
    } catch (err) {
      console.log(err);
    }
  }, [onLoadComplete]);

  useEffect(() => {
    fetchVaccines(1);
  }, [fetchVaccines]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  }

  // const handlePageChange = async (newPage: number) => {
  //   setPage(newPage);
  //   await fetchVaccines(newPage);
  // };


  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex">
        <h1 className="text-2xl font-bold text-blue-900">Vaccine List</h1>
        <p className="cursor-pointer ml-auto italic font-bold text-blue-700"
        onClick={() => nav('vaccineType')}
        >
          View All</p>
      </div>
      <div className="h-[0.5px] bg-black mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {vaccines.map((vaccine) => (
          <div
            key={vaccine.id}
            className="border rounded-lg shadow-md p-4 text-center hover:shadow-lg cursor-pointer transition-shadow duration-200"
            onClick={() => handleClickVaccine(vaccine.id)}
          >
            <img
              src={vaccine.image ? baseUrl + vaccine.image : VaccineImage}
              alt={vaccine.vaccine_Name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-lg font-semibold text-gray-800">{vaccine.vaccine_Name}</h2>
            <p className="text-gray-600">Country: {vaccine.origin}</p>
            <span className="text-black-600">Price:</span>
            <span className="text-red-600 font-bold"> {formatCurrency(Number(vaccine.selling_Price))}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VaccineListComponent;
