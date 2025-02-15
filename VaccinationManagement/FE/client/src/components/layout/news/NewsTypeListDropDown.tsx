import NewsTypeService from "@/services/NewsTypeService";
import { NewsType } from "@/types/newsTypes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NewsTypeList = () => {
    const [newsTypes, setNewsTypes] = useState<NewsType[]>([]);
    const nav = useNavigate();
    const fetchNewsTypes = async () => {
        try {
            const query = {
                pageIndex: 1,
                pageSize: 10,
                searchTerm: '',
                status: true,
            };
            const data = await NewsTypeService.GetAllNewsTypes(query);
            setNewsTypes(data.newsTypeList);
        } catch (err) {
            console.log(err);

        }
    };

    useEffect(() => {
        fetchNewsTypes();
    }, []);

    const handleToggleClick = (id: string) => {
        nav(`newsType/${id}`);
    };

    return (
        <ul
        className="absolute left-0 mt-2 bg-white text-gray-700 shadow-lg opacity-0 hidden
        group-hover:opacity-100 group-hover:block transition-all rounded-md w-80">
        {newsTypes.map(newsType => (
            <li
                key={newsType.id}
                className="px-4 rounded-md w-[90%] mx-auto py-2 cursor-pointer hover:bg-gray-200 hover:text-black"
                onClick={() => {
                        handleToggleClick(newsType.id)
                    }}
                >
                    <p>{newsType.news_Type_Name}</p>
                </li>
            ))}
        </ul>
    )
};

export default NewsTypeList;