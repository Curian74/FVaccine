import Image1 from '@/assets/images/aboutUs/mission1.png'
import Image2 from '@/assets/images/aboutUs/mission2.png'
import NewsSidebarComponent from '@/components/layout/news/NewsSidebar'

type Banner = {
    image: string;
}
const BannerList: Banner[] = [
    { image: Image1 },
    { image: Image2 },
]

const MissionPage = () => {

    return (
        <div className="mx-12 my-10 flex gap-x-4">
            <div className="w-3/4 mr-3">
                <div>
                    <div className="border-b-[1.5px] w-fit border-blue-900">
                        <h1 className="text-2xl text-blue-900 font-extrabold">OUR MISSION</h1>
                    </div>
                    <div className="h-[1px] bg-gray-500"></div>
                </div>
                <div className="my-5">
                    <p className="text-[1.1rem] text-justify font-sans text-gray-700">
                        Tasked with the great mission to “protect our children from infectious threats”, we join hands with parents to give them a healthy start, prepare them to fight off diseases and pave their way towards a bright future.
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
export default MissionPage;