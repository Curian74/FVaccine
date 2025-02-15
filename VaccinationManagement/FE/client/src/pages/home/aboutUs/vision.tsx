import Vision1 from '@/assets/images/aboutUs/vision1.png'
import Vision2 from '@/assets/images/aboutUs/vision2.png'
import Vision3 from '@/assets/images/aboutUs/vision3.png'
import Vision4 from '@/assets/images/aboutUs/vision4.png'
import NewsSidebarComponent from '@/components/layout/news/NewsSidebar'

type Vision = {
    vision: string;
}
const VisionList: Vision[] = [
    { vision: Vision1 },
    { vision: Vision2 },
    { vision: Vision3 },
    { vision: Vision4 },
]

const VisionPage = () => {

    return (
        <div className="mx-12 my-10 flex gap-x-4">
            <div className="w-3/4 mr-3">
                <div>
                    <div className="border-b-[1.5px] w-fit border-blue-900">
                        <h1 className="text-2xl text-blue-900 font-extrabold">OUR VISION</h1>
                    </div>
                    <div className="h-[1px] bg-gray-500"></div>
                </div>
                <div className="my-5">
                    <p className="text-[1.1rem] text-justify font-sans text-gray-700">
                        Aiming to become the leading system of vaccination centers in Vietnam, we strive to secure a highly qualified and trustworthy source of vaccines,
                        selected from renown international suppliers while continuously building modern, advanced facilities.
                        Furthermore, we consider comfort and convenience as two important aspects in terms of customer experience.
                        Each injection room is equipped with the modern and cutting-edge vaccine preservation equipments, imported from Germany and Japan. Our teams of doctors and specialists are well-trained.The waiting areas exude a sense of comfort, relaxation and in turn creating a family-friendly environment thanks to colorful decorations. Join us and experience the service yourself!</p>
                </div>
                <div className="items-center gap-y-5">
                    {VisionList.map(image => image && (
                        <img src={image.vision} alt="Vision" className="w-2/3 mx-auto mt-3" />
                    ))}
                </div>
            </div>
            <div className="w-1/4">
                <NewsSidebarComponent />
            </div>
        </div>
    );
};
export default VisionPage;