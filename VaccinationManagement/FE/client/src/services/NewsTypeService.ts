import { NewsType, NewsTypeUpdateRequest } from "@/types/newsTypes";
import api from "./api";

const GetAllNewsTypes = async (query: object) => {
  const response = await api.get("/NewsType", {
    params: query
  })
  return response.data;
}

const GetActiveNewsTypes = async (): Promise<NewsType[]> => {
  try {
    const response = await api.get<NewsType[]>("/NewsType/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching news types:", error);
    return [];
  }
};

const ChangeNewsTypeStatus = async (newsTypes: NewsTypeUpdateRequest[]) => {
  try {
    const response = await api.put<NewsTypeUpdateRequest[]>('/NewsType/change-status', { newsTypes });
    return response.data;
  } catch (error) {
    console.error('Error updating positions:', error);
    throw error;
  }
};

const UpdateNewsTypes = async (newsTypes: NewsTypeUpdateRequest[]) => {
  try {
    const response = await api.put<NewsTypeUpdateRequest[]>('/NewsType/update', { newsTypes });
    return response.data;
  } catch (error) {
    console.error('Error updating news type:', error);
    throw error;
  }
};

const NewsTypeService = {
  GetAllNewsTypes,
  GetActiveNewsTypes,
  ChangeNewsTypeStatus,
  UpdateNewsTypes,
};

export default NewsTypeService;