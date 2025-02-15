import api from "./api"
import { Place, PlaceQuery } from "@/types/place";

const GetPlaces = async (active = true) => {
  const response = await api.get("Places?active=" + active);
  return response.data;
};

const GetPlaceById = async (id: string) => {
  const response = await api.get("Places/" + id);
  return response.data;
};

const GetPlacesPaged = async (page = 1, pageSize = 10, query?: string, active?: boolean, exact = false) => {
    const params: Record<string, string> = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      exact: exact.toString()
    };

    if (query) params.query = query;
    params.active = (active ?? true).toString();
  
    const queryString = new URLSearchParams(params ).toString();
    const response = await api.get(`Places/paged?${queryString}`);
    return response.data;
};

const GetLatestPlace = async () => {
  const response = await api.get("Places/latest");
  return response.data;
};

const CreatePlace = async (place: Place): Promise<Place> => {
  const response = await api.post("/Places", place);
  return response.data;
}

const UpdatePlace = async (place: PlaceQuery): Promise<Place> => {
  const response = await api.put("/Places", place);
  return response.data;
}

const UpdatePlaces = async (places: PlaceQuery[]): Promise<string[] | void> => {
  const response = await api.put("/Places/list", {
    queries: places
  });
  return response.data;
}

const PlaceService = {
  GetPlaces,
  GetPlacesPaged,
  GetLatestPlace,
  GetPlaceById,
  CreatePlace,
  UpdatePlace,
  UpdatePlaces,
}

export default PlaceService
