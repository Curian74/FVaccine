import NewService from "@/services/NewsService";
import { News } from "@/types/news";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NewImage from "@/assets/images/news/NewsImage.png"
import { Icon, Loader } from "semantic-ui-react";


const PAGE_SIZE = 7;
const NewsTypePage = () => {
    const { newsTypeId } = useParams<{ newsTypeId: string }>();
    const [news, setNews] = useState<News[]>([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [totalNews, setTotalNews] = useState(0);

    const totalPages = Math.ceil(totalNews / PAGE_SIZE);
    const nav = useNavigate();
    const baseUrl = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        setPageIndex(1);
    }, [newsTypeId]);

    useEffect(() => {
        const queryObject = {
            PageIndex: pageIndex,
            PageSize: PAGE_SIZE,
            NewsTypeId: newsTypeId
        };
        const fetchNews = async () => {
            try {
                const data = await NewService.GetListNewsByNewsTypeId(queryObject);
                console.log(pageIndex, "PAGE")
                setNews(data.newsList);
                setTotalNews(data.totalNews);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNews();
    }, [newsTypeId, pageIndex, PAGE_SIZE]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const handleToggleClick = (id: string) => {
        nav(`/home/news/${id}`);
    };

    const handlePageChange = (page: number) => {
        setPageIndex(page);
    };


    if (!news) {
        return <Loader active inline="centered" />;
    }

    return (
        <div className="mx-12">
            <div className="text-center relative justify-center my-20">
                <h1 className="text-4xl font-extrabold text-blue-900">NEWS</h1>
                <div className="h-1.5 mt-2 w-20 m-auto bg-gray-700"></div>
            </div>
            {news[0] && (
                <div className="flex w-full border border-gray-400"
                    onClick={() => handleToggleClick(news[0].id)}
                >
                    <div className="w-1/2 cursor-pointer">
                        {news[0].thumbnail ?
                            <img src={`${baseUrl}/${news[0].thumbnail}`} alt={news[0].title} className="w-full h-full" />
                            :
                            <img src={NewImage} alt={news[0].title} className="w-full h-full" />
                        }
                    </div>
                    <div className="w-1/2 mx-3 text-gray-600 items-center my-auto">
                        <h1 className="text-black text-xl font-bold cursor-pointer">{news[0].title}</h1>
                        <div className="my-3">
                            <span><Icon name="calendar alternate" /></span>
                            <span>{formatDate(news[0].postDate)}</span>
                        </div>
                        <p className="text-lg">
                            {news[0].preview.length > 300
                                ? `${news[0].preview.slice(0, 300)}...`
                                : news[0].preview}
                        </p>
                    </div>
                </div>
            )}
            <div className="mb-16">
                <div className="grid grid-cols-3 gap-8">
                    {news.slice(1).map((item) => (
                        <div key={item.id}>
                            <div className="pt-5 cursor-pointer"
                                onClick={() => handleToggleClick(item.id)}
                            >
                                {item.thumbnail ? (
                                    <img src={`${baseUrl}/${item.thumbnail}`} alt={item.title} className="max-w-50 max-h-30" />
                                ) : <img src={NewImage} alt={item.title} className="max-w-50 max-h-30" />}
                                <h1 className="my-3 text-xl font-bold">{item.title}</h1>
                                <div className="text-gray-600">
                                    <span><Icon name="calendar alternate" /></span>
                                    <span>{formatDate(item.postDate)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="my-5">
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, index) => index + 1).reduce((pages, page) => {
                                if (totalPages > 4) {
                                    if (page === 1 || page === totalPages || page === pageIndex || Math.abs(page - pageIndex) === 1) {
                                        pages.push(page);
                                    } else if (
                                        (page === pageIndex - 2 && pageIndex > 3) ||
                                        (page === pageIndex + 2 && pageIndex < totalPages - 2)
                                    ) {
                                        pages.push('...');
                                    }
                                } else {
                                    pages.push(page);
                                }
                                return pages;
                            }, [] as (number | string)[]).map((item, index) => (
                                <button
                                    key={index}
                                    className={`px-4 py-2 text-gray-700 rounded-full ${item === pageIndex ? 'bg-blue-700 text-white' : ''
                                        }`}
                                    onClick={() => typeof item === 'number' && handlePageChange(item)}
                                    disabled={item === '...'}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>



                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsTypePage;