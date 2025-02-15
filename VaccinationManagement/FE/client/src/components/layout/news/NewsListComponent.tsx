import { useEffect, useState } from "react";
import NewImage from "@/assets/images/news/NewsImage.png";
import { News } from "@/types/news";
import NewService from "@/services/NewsService";
import { useNavigate } from "react-router-dom";
const baseUrl = import.meta.env.VITE_BASE_URL
const PAGE_SIZE = 99

type NewsListComponentProps = {
    newsTypeId?: string
    newsId?: string
}
const NewsListComponent = ({ newsTypeId, newsId }: NewsListComponentProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [news, setNews] = useState<News[]>([]);

    const nav = useNavigate();
    const visibleItems = 3;

    useEffect(() => {
        const fetchNews = async () => {
            const query = {
                pageIndex: 1,
                pageSize: PAGE_SIZE,
                searchTerm: "",
                status: true,
                ...(newsId && {newsId}) ,
                ...(newsTypeId && {newsTypeId})
            };
            let data
            if (newsTypeId) {
                data = await NewService.GetListNewsByNewsTypeId(query);
            }
            else {
                data = await NewService.GetNewsList({ query });
            }
            setNews(data.newsList);
            console.log(data);

        }
        fetchNews();
    }, [newsTypeId, newsId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                (prevIndex + 1) % news.length
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [news]);

    const getVisibleNews = () => {
        const startIndex = currentIndex;
        if (startIndex + visibleItems > news.length) {
            return news.slice(startIndex);
        }
        return [
            ...news.slice(startIndex, startIndex + visibleItems),
            ...news.slice(0, Math.max(0, startIndex + visibleItems - news.length)),
        ];
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="relative w-full overflow-hidden">
                <div className="flex justify-center gap-4 ">
                    {getVisibleNews().map((news) => (
                        <div
                            key={news.id}
                            className="flex-shrink-0 w-1/3 px-2 cursor-pointer"
                            onClick={() => nav(`/home/news/${news.id}`)}
                        >
                            <div className=" rounded-lg overflow-hidden">
                                <img
                                    src={news.thumbnail ? baseUrl + news.thumbnail : NewImage}
                                    alt={news.title}
                                    className="w-full h-50 object-cover"
                                />
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                        {news.title}
                                    </h2>
                                    <p className="text-gray-600">
                                        {news.preview.length > 200 ? `${news.preview.slice(0, 200)}...` : news.preview}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsListComponent;
