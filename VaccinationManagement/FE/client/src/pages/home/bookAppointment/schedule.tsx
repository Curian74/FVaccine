import { Icons } from "@/components/Icons";
import { HistoryInjectionTable } from "@/components/layout/vaccineResult/HistoryInjection";


const ScheduleInjections = () => {
    return (
        <div className="flex mt-5">
            <div className="w-full xl:w-3/4 mx-auto">
                <div className="flex w-full bg-gray-200 py-5">
                    <div className="mx-2 w-1/12 xl:mx-4 py-1.5 font-medium flex items-center select-none">
                        <Icons.logo className="h-6 w-6" />
                        <span
                            className="hidden text-xl capitalize font-extrabold md:block bg-gradient-to-b from-blue-500 to-blue-900 text-transparent bg-clip-text"

                        >
                            FVC
                        </span>
                    </div>
                    <div className="items-center w-11/12 mt-1.5 ">
                        <span className="text-2xl uppercase font-extrabold text-blue-900"
                        >Vaccination History</span>
                    </div>
                </div>
                <HistoryInjectionTable />
            </div>
        </div>
    )
};

export default ScheduleInjections;