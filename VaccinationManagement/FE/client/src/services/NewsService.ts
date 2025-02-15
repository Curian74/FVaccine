import { News } from "@/types/news";
import api from "./api";

const GetNewsList = async (query: object) => {
    const response = await api.get('/news', {
        params: query
    });
    return response.data;
};

const GetNextId = async () => {
    const response = await api.get('/news/next-id');
    return response.data;
}

const CreateNews = async (news: News): Promise<News> => {
    const response = await api.post("/news", news);
    return response.data;
};

const GetNewsById = async (id: string | undefined): Promise<News> => {
    const response = await api.get(`/news/${id}`);
    return response.data;
}

const UpdateNews = async (id: string | undefined, news: News) => {
    await api.put<News>(`/news/${id}`, news);
}

const ChangeNewsStatus = async (newsId: string[]): Promise<void> => {
    await api.put(`/news/status`, { newsId });
};

const GetListNewsByNewsTypeId = async (query: object) => {
    const response = await api.get('/news/get-by-type', {
        params: query
    });
    return response.data;
};

const UploadThumbnail = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/news/thumbnail-upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};


const NewService = {
    GetNewsList,
    GetNextId,
    CreateNews,
    GetNewsById,
    UpdateNews,
    ChangeNewsStatus,
    GetListNewsByNewsTypeId,
    UploadThumbnail
};

export default NewService;