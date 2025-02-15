import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VaccineBanner from "@/assets/images/banner/vaccineBanner.jpg"
import VaccineService from "@/services/VaccineService";
import { Vaccine } from "@/types/vaccine";
// import NewsSidebarComponent from "@/components/layout/news/NewsSidebar";
// import Loading from "@/components/layout/Loading";

const VaccineDetail: FC = () => {
    const { vaccineId } = useParams<{ vaccineId: string }>();
    const [vaccine, setVaccine] = useState<Vaccine>();
    // const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVaccine = async () => {
            try {
                const data = await VaccineService.GetVaccineById(vaccineId!);
                setVaccine(data);
                // setIsLoading(false);
            } catch (err) {
                console.log(err);
            }
        }
        fetchVaccine();
    }, [vaccineId])

    const formatCurrency = (value: number) => {
        return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }

    // if (isLoading) return <Loading/>

    return (
        <div className="mx-12">
            <div className="w-full  relative overflow-hidden h-80">
                {/* Vaccine Image */}
                <img
                    src={VaccineBanner}
                    alt={`Vaccine ${vaccine?.vaccine_Name}`}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="my-5">
                <span className="font-extrabold text-4xl text-blue-900">
                    {vaccine?.vaccine_Name} ({vaccine?.origin})
                </span>
            </div>

            <div className="flex">
                <div className="w-1/4 mt-16 mr-5 flex flex-col gap-y-7">
                    <div className="shadow-md rounded-md py-2 px-1">
                        <span className="text-xl font-extrabold text-blue-900 mx-3">
                            1. Vaccine Information</span>
                    </div>
                    <div className="shadow-md rounded-md py-2 px-1">
                        <span className="text-xl font-extrabold text-blue-900 mx-3">
                            2. Indication</span>
                    </div>
                    <div className="shadow-md rounded-md py-2 px-1">
                        <span className="text-xl font-extrabold text-blue-900 mx-3">
                            3. Dosage regimen and schedule</span>
                    </div>
                </div>

                <div className="w-3/4 ml-3">
                    <div className="rounded-2xl border my-5 border-blue-900">
                        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-3 w-full rounded-t-2xl">
                            <span className="text-2xl font-extrabold text-orange-500 mx-3">
                                1. Vaccine Information</span>
                        </div>
                        <div className="mx-3 pb-7 text-lg text-gray-700">
                            <div className="mt-5">
                                <p >{vaccine?.description}</p>
                            </div>
                            <div className="my-5">
                                <p className="text-2xl my-3 font-extrabold text-blue-900">
                                    Contraindications
                                </p>
                                <p>{vaccine?.contraindication}</p>
                            </div>
                            <div className="my-5">
                                <p className="text-2xl my-3 font-extrabold text-blue-900">
                                    Price
                                </p>
                                <p className="text-red-600 mx-3">{formatCurrency(Number(vaccine?.selling_Price))}</p>
                            </div>
                        </div>

                    </div>
                    <div className="rounded-2xl my-5 border border-blue-900">
                        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-3 w-full rounded-t-2xl">
                            <span className="text-2xl font-extrabold text-orange-500 mx-3">
                                2. Indication</span>
                        </div>
                        <div className="mx-3 pb-7 text-lg text-gray-700">
                            <div className="m-5">
                                <p>• {vaccine?.indication}</p>
                            </div>
                        </div>

                    </div>

                    <div className="rounded-2xl my-5 border border-blue-900">
                        <div className="bg-gradient-to-r from-blue-900 to-blue-700 py-3 w-full rounded-t-2xl">
                            <span className="text-2xl font-extrabold text-orange-500 mx-3">
                                3. Dosage regimen and schedule</span>
                        </div>
                        <div className="mx-3 pb-7 text-lg text-gray-700">
                            <div className="my-5">
                                <p>{vaccine?.usage}</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    )
};

export default VaccineDetail;