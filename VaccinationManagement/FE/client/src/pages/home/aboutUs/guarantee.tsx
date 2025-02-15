import Image1 from '@/assets/images/aboutUs/guarantee1.png'
import NewsSidebarComponent from '@/components/layout/news/NewsSidebar'

type Banner = {
    image: string;
}
const BannerList: Banner[] = [
    { image: Image1 },
]

const GuaranteePage = () => {

    return (
        <div className="mx-12 my-10 flex gap-x-4">
            <div className="w-3/4 mr-3">
                <div>
                    <div className="border-b-[1.5px] w-fit border-blue-900">
                        <h1 className="text-2xl text-blue-900 font-extrabold">OUR GUARANTEE</h1>
                    </div>
                    <div className="h-[1px] bg-gray-500"></div>
                </div>
                <div className="my-5">
                    <p className="text-[1.1rem] text-justify font-sans text-gray-700">
                        Your personal information is of utmost importance to us and will be kept confidential. You can easily access this during future visits at different centers of VNVC without having to redeclare any information. You can also check the vaccination record or make appointments through our official website.
                        After successful registrations for vaccinations, you will receive a reminder message by our customer service prior to the date of appointment.
                    </p>
                </div>
                <div className="items-center gap-y-5">
                    {BannerList.map(image => image && (
                        <img src={image.image} alt="Vision" className="w-2/3 mx-auto mt-3" />
                    ))}
                </div>
            </div>
            <div className="w-1/4">
                <NewsSidebarComponent />
            </div>
        </div>
    );
};
export default GuaranteePage;