import { Position, PositionUpdateRequest } from "@/types/position";
import api from "./api";


const GetPositions = async (query: object) => {
  const response = await api.get('/Position', {
    params: query
  });
  return response.data;
};

const GetActivePositions = async (): Promise<Position[]> => {
  try {
    const response = await api.get<Position[]>("/Position-active");
    return response.data;
  } catch (error) {
    console.error("Error fetching positions:", error);
    return [];
  }
};

const CreatePosition = async (position: Position): Promise<Position> => {
  const response = await api.post("/Position", position);
  return response.data;
}

const GetPositionById = async (id: string): Promise<Position> => {
  const response = await api.get<Position>(`/Position/${id}`);
  return response.data;
}

const ChangePositionStatus = async (positions: PositionUpdateRequest[]) => {
  try {
    const response = await api.put<PositionUpdateRequest[]>('/Position/change-status', { positions });
    return response.data;
  } catch (error) {
    console.error('Error updating positions:', error);
    throw error;
  }
};


const UpdatePositions = async (positions: PositionUpdateRequest[]) => {
  try {
    const response = await api.put<PositionUpdateRequest[]>('/Position/update', { positions });
    return response.data;
  } catch (error) {
    console.error('Error updating positions:', error);
    throw error;
  }
};

const PositionService = {
  GetPositions,
  CreatePosition,
  GetActivePositions,
  GetPositionById,
  ChangePositionStatus,
  UpdatePositions
};

export default PositionService;
