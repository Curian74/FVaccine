import api from "./api";
import { VaccineType } from "@/types/vaccineType";
import FormatId from "@/helpers/constants/FormatID.json"
const GetAllVaccineTypes = async (): Promise<VaccineType[]> => {
    const response = await api.get<VaccineType[]>("/VaccineType");
    return response.data;
}

const GetPaginatedVaccineTypes = async (pageIndex?: number, pageSize?: number, searchTerm?: string, isActive?: boolean) => {
    const response = await api.get(`/VaccineType/page`, {
        params: {
            pageIndex,
            pageSize,
            searchTerm,
            isActive 
        },
    });
    return response.data; //{ items: VaccineType[], pageIndex, totalPages }
}

const CreateVaccineType = async (vaccine: VaccineType): Promise<VaccineType> => {
    const response = await api.post("/VaccineType", vaccine);
    return response.data;
}
const UpdateVaccineType = async (vaccine: VaccineType): Promise<VaccineType> => {
    const response = await api.put("/VaccineType", vaccine);
    return response.data;
}

const GetVaccineTypeById = async (id: string): Promise<VaccineType> => {
    const response = await api.get<VaccineType>(`/VaccineType/${id}`);
    return response.data;
}

const GetVaccineTypeByName = async (name: string): Promise<VaccineType> => {
    const response = await api.get<VaccineType>(`/VaccineType/name/${name}`);
    return response.data;
}

const GetLastVaccineType = async (): Promise<string> => {
    const response = await api.get<VaccineType>(`/VaccineType/last-vaccine-type`);
    return response.data.id ? response.data.id : FormatId.VaccineType;
}
const MakeInactiveVaccineType = async (vaccines: VaccineType[]): Promise<VaccineType[]> => {
    const response = await api.put("/VaccineType/make-inactive", vaccines);
    return response.data;
}

const UploadImage = async (formData: FormData): Promise<UploadImageResponse> => {
    try {
        const response = await api.post("/VaccineType/upload-image", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch {
        throw new Error("Upload Image Failed!");
    }
}


const VaccineTypeService = {
    GetAllVaccineTypes,
    GetVaccineTypeById,
    GetLastVaccineType,
    GetPaginatedVaccineTypes,
    CreateVaccineType,
    MakeInactiveVaccineType,
    UpdateVaccineType,
    UploadImage,
    GetVaccineTypeByName,
};

export default VaccineTypeService;
