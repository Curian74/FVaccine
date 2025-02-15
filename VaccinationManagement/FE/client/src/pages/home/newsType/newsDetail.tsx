import NewService from "@/services/NewsService";
import { News } from "@/types/news";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Loader } from "semantic-ui-react";
import Avatar from "@/assets/images/user_online.png"
import { Employee } from "@/types/employee";
import EmployeeService from "@/services/EmployeeService";
import NewsListComponent from "@/components/layout/news/NewsListComponent";
import DOMPurify from "dompurify";
import 'react-quill/dist/quill.snow.css';
import NewsImagesPanel from "@/components/layout/news/NewsImagesPanel";

const NewsDetailPage = () => {
    const { newsId } = useParams<{ newsId: string }>();
    const [news, setNews] = useState<News>();
    const [author, setAuthor] = useState<Employee>();

    const baseURL = import.meta.env.VITE_BASE_URL;

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await NewService.GetNewsById(newsId);
                setNews(data);
                const author = await EmployeeService.GetEmployeeById(data.authorId);
                setAuthor(author);
                console.log(data);

            }
            catch (err) {
                console.log(err);
            }
        }
        fetchNews();
    }, [newsId])


    const createSafeHTML = (html: string) => {
        const sanitized = DOMPurify.sanitize(html);
        return { __html: sanitized };
    };

    if (!news) return <Loader active inline="centered"></Loader>

    return (
        <div>
            <div className="xl:w-2/3 md:w-4/5 mx-auto items-center mt-6">
                <h1 className="text-center font-bold text-3xl text-blue-900 uppercase">
                    {news.title}</h1>
                <div className="h-1 mt-1 bg-blue-900"></div>

                <div className="bg-gray-100 p-3 mt-5 items-center">
                    <div className="flex ">
                        <img src={author?.image ? `${baseURL}${author.image}` : Avatar} className="h-20 w-20 rounded-full" alt="Author image" />
                        <div className="my-auto mx-3">
                            <p>Posted by</p>
                            <p className="font-bold mt-1">{author?.employee_Name}</p>
                            <p>{new Date(news.postDate).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="my-5 w-full">
                    <p className="text-justify italic text-lg text-gray-700">{news.preview}</p>
                    <NewsImagesPanel></NewsImagesPanel>
                    <div
                        className="text-justify text-lg text-gray-700 ql-editor"
                        dangerouslySetInnerHTML={createSafeHTML(news.content)}>
                    </div>
                </div>
                <div>
                    <h1 className="font-extrabold text-3xl text-blue-700 text-center">Related Posts</h1>
                    <div className="bg-gray-700 h-1.5 w-20 mx-auto my-3"></div>
                    <NewsListComponent newsTypeId={news.news_Type_Id} newsId={news.id!} />
                </div>
            </div>
        </div>
    )
}
export default NewsDetailPage