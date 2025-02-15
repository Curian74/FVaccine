import api from "./api";

const GetAllImagesByNewsId = async(newsId: string) =>{
    const response = await api.get(`/NewsImage?newsId=${newsId}`)
    return response.data;
}

const DeleteImages = async(imageIds: string[]) =>{
    const command = await api.delete(`/NewsImage`, {
        data:{
            newsImageIds: imageIds
        }
    });

    return command.data;
}

const UploadNewsImages = async (newsId: string, formData: FormData): Promise<any> => {
    const response = await api.post(`/NewsImage/${newsId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data;
};

const NewsImageService = {
    GetAllImagesByNewsId,
    DeleteImages,
    UploadNewsImages,
};

export default NewsImageService;