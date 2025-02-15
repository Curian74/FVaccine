import { MonthlySummary } from "@/types/vaccine";
import api from "./api";
import { Vaccine } from "@/types/vaccine";
import { Distribution } from "@/types/distribution";

const GetVaccines = async (page: number, pageSize: number, searchTerm: string, isActive: boolean) => {
    const response = await api.get(`/Vaccine`, {
        params: { page, pageSize, searchTerm, isActive }
    });
    return response.data;
};

const GetVaccineByVaccineTypeId = async (page: number, pageSize: number, searchTerm: string, vaccineTypeId?: string) => {
    const response = await api.get(`/Vaccine/get-by-typeId`, {
        params: { page, pageSize, searchTerm, vaccineTypeId }
    });
    return response.data;
};

const GetAllVaccines = async (): Promise<Vaccine[]> => {
    const response = await api.get("/Vaccine/get-all");
    return response.data;
};

const GetVaccineById = async (id: string): Promise<Vaccine> => {
    const response = await api.get<Vaccine>(`/Vaccine/${id}`);
    return response.data;
}

const GenerateVaccineId = async (): Promise<string> => {
    const response = await api.get("/Vaccine/generate-id");
    return response.data;
};

const CreateVaccine = async (vaccine: Vaccine) => {
    const response = await api.post("/Vaccine", vaccine);
    //console.log(response.data);
    return response.data;
};

const GetVaccineDistributions = async (pageIndex = 1, PageSize = 10, VaccineId?: string, PlaceId?: string, PlaceName?: string, DateRangeStart?: string, DateRangeEnd?: string, OrderBy?: string) => {
    const requestString = "Vaccine/distribution/paged?"
    const params: Record<string, string> = {
        pageIndex: pageIndex.toString(),
        PageSize: PageSize.toString(),
    };

    if (VaccineId) params.VaccineId = VaccineId;
    if (PlaceId) params.PlaceId = PlaceId;
    if (PlaceName) params.PlaceName = PlaceName;
    if (DateRangeStart) params.DateRangeStart = DateRangeStart;
    if (DateRangeEnd) params.DateRangeEnd = DateRangeEnd;
    if (OrderBy) params.OrderBy = OrderBy;

    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(requestString + queryString);
    return response.data;
};

const GetVaccineDistributionsGroupedByVacAndPlace = async (pageIndex = 1, PageSize = 10, VaccineId?: string, PlaceId?: string, PlaceName?: string, DateRangeStart?: string, DateRangeEnd?: string, OrderBy?: string, MinQuantity?: number) => {
    const requestString = "Vaccine/distribution/vaccineandplace/paged?"
    const params: Record<string, string> = {
        pageIndex: pageIndex.toString(),
        PageSize: PageSize.toString(),
    };

    if (VaccineId) params.VaccineId = VaccineId;
    if (PlaceId) params.PlaceId = PlaceId;
    if (PlaceName) params.PlaceName = PlaceName;
    if (DateRangeStart) params.DateRangeStart = DateRangeStart;
    if (DateRangeEnd) params.DateRangeEnd = DateRangeEnd;
    if (OrderBy) params.OrderBy = OrderBy;
    if (MinQuantity) params.MinQuantity = MinQuantity + "";

    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(requestString + queryString);
    return response.data;
};

const DistributeVaccine = async (distribution: Distribution): Promise<Distribution> => {
    const response = await api.post("/Vaccine/distribute", distribution);
    return response.data;
};

const UpdateVaccine = async (vaccine: Vaccine) => {
    const response = await api.put(`/Vaccine`, vaccine);
    return response.data;
};

const MakeVaccinesInactive = async (vaccineIds: string[]): Promise<void> => {
    await api.put(`/Vaccine/inactive`, { vaccineIds });
};

const ImportVaccine = async (formData: FormData) => {
    try {
        const response = await api.post('/vaccine/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            // Pass the error message from the backend
            throw new Error(error.response.data.error);
        } else {
            throw new Error('An unexpected error occurred.');
        }
    }
};

const GetRangeYear = async () => {
    const response = await api.get(`vaccine/date-range`);
    return response.data;
};
const GetMonthlyInjectionSummary = async (year: string): Promise<MonthlySummary[]> => {
    const response = await api.get(`vaccine/monthly-summary?year=${year}`);
    return response.data;
}

const GetVaccinesFilter = async (
    pageIndex = 1,
    pageSize = 10,
    FromNextInjectDate?: string,
    ToNextInjectDate?: string,
    Origin?: string,
    VaccineTypeId?: string,
) => {
    const params: Record<string, string> = {
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
    };

    if (FromNextInjectDate) params.FromNextInjectDate = FromNextInjectDate;
    if (ToNextInjectDate) params.ToNextInjectDate = ToNextInjectDate;
    if (Origin) params.Origin = Origin;
    if (VaccineTypeId) params.VaccineTypeId = VaccineTypeId;

    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`vaccine/filter?${queryString}`);
    return response.data;
};

const AllVaccines = async (pageIndex: number, pageSize: number, searchTerm: string) => {
    const response = await api.get('/Vaccine/all-vaccines', {
        params: {
            pageIndex,
            pageSize,
            searchTerm,
        }
    })
    return response.data;
}

const VaccineService = {
    CreateVaccine,
    DistributeVaccine,
    GenerateVaccineId,
    GetAllVaccines,
    UpdateVaccine,
    MakeVaccinesInactive,
    ImportVaccine,
    GetVaccines,
    GetVaccineByVaccineTypeId,
    GetVaccineById,
    GetVaccinesFilter,
    GetRangeYear,
    GetMonthlyInjectionSummary,
    GetVaccineDistributions,
    GetVaccineDistributionsGroupedByVacAndPlace,
    AllVaccines,
};

export default VaccineService;
