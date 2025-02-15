import NewService from "@/services/NewsService";
import { News } from "@/types/news";
import { useEffect, useState } from "react";
import NewsImage from '@/assets/images/news/NewsImage.png'
import { useNavigate } from "react-router-dom";
const PAGE_SIZE = 4
const NewsSidebarComponent = () => {
    const [news, setNews] = useState<News[]>([]);
    const nav = useNavigate();
    const baseURL = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const query = {
                    pageIndex: 1,
                    pageSize: PAGE_SIZE,
                    searchTerm: '',
                    status: true
                }
                const data = await NewService.GetNewsList(query);
                setNews(data.newsList);
            } catch (error) {
                console.error("Error fetching latest news:", error);
            }
        }
        fetchNews();
    }, [])
    return (
        <div className="border rounded-lg bg-gray-200 shadow-md overflow-hidden">
            {news.map(news => news && (
                <div className="">
                    <div className="max-w-sm">
                        <img
                            className="w-full h-48 object-cover"
                            src={news.thumbnail ? baseURL + '/' + news.thumbnail : NewsImage}
                            alt="Vaccination image"
                        />
                        <div className="p-4">
                            <h2 className="text-lg font-bold text-blue-900">
                                {news.title}
                            </h2>
                            <p className="text-sm text-gray-600 mt-2">
                                {news.preview.length > 200 ? `${news.preview.slice(0, 300)}...` : news.preview}
                            </p>
                        </div>
                        <button className="rounded-xl bg-blue-900 text-white px-2 text-sm font-bold mx-3"
                            onClick={() => { nav(`/home/news/${news.id}`) }}
                        >
                            READ MORE
                        </button>
                    </div>
                    <div className="h-[1px] bg-gray-400 my-5 mx-3"></div>
                </div>


            ))}
        </div>
    )
}
export default NewsSidebarComponent;