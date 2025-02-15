import { VaccinationResult } from "@/types/vaccinationResult";
import { VaccinationResultStatus } from "@/types/vaccinationResultStatus";
import api from "./api"

const GetVaccinationResults = async () => {
  const response = await api.get("VaccinationResults");
  return response.data;
};

const GetVaccinationResultById = async (id: string) => {
  const response = await api.get("VaccinationResults/" + id);
  return response.data;
};

const GetVaccinationResultsPaged = async (page = 1, pageSize = 10, status?: VaccinationResultStatus, query?: string) => {
  const response = await api.get("VaccinationResults/paged?page=" + page
    + "&pageSize=" + pageSize
    + ((status) ? "&status=" + status : "")
    + ((query) ? "&query=" + query : ""));
  return response.data;
};

const GetVaccinationResultsFilter = async (
  pageIndex = 1,
  pageSize = 10,
  FromInjectDate?: string,
  ToInjectDate?: string,
  Prevention?: string,
  VaccineTypeId?: string,
  CustomerId?: string,
  VaccineId?: string,
  Status?: VaccinationResultStatus,
  Injection_Number?: string,
) => {
  const params: Record<string, string> = {
    pageIndex: pageIndex.toString(),
    pageSize: pageSize.toString(),
  };

  if (FromInjectDate) params.FromInjectDate = FromInjectDate;
  if (ToInjectDate) params.ToInjectDate = ToInjectDate;
  if (Prevention) params.Prevention = Prevention;
  if (VaccineTypeId) params.VaccineTypeId = VaccineTypeId;
  if (CustomerId) params.CustomerId = CustomerId;
  if (VaccineId) params.VaccineId = VaccineId;
  if (Status != null) params.Status = Status.toString();
  if (Injection_Number) params.Injection_Number = Injection_Number;

  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`VaccinationResults/filter?${queryString}`);
  return response.data;
};

const GetLatestVaccinationResult = async () => {
  const response = await api.get("VaccinationResults/latest");
  return response.data;
};

const CreateVaccinationResult = async (res: VaccinationResult): Promise<VaccinationResult> => {
  const response = await api.post("/VaccinationResults", res);
  return response.data;
}

const UpdateVaccinationResult = async (res: VaccinationResult): Promise<VaccinationResult> => {
  const response = await api.put("/VaccinationResults", res);
  return response.data;
}

const GetRangeYear = async () => {
  const response = await api.get(`VaccinationResults/date-range`);
  return response.data;
};

const UpdateStatus = async (id: string, isVaccinated = VaccinationResultStatus.Injected): Promise<VaccinationResult> => {
  const response = await api.put("/VaccinationResults/update-status", {Id: id, IsVaccinated: isVaccinated});
  return response.data;
}

const GetByCustomerId = async (
  customerId: string,
  pageIndex = 1,
  pageSize = 10,
  query?: string,
  status?: VaccinationResultStatus
) => {
  const params = new URLSearchParams({
    CustomerId: customerId,
    pageIndex: pageIndex.toString(),
    PageSize: pageSize.toString(),
  });
  if (query) params.append("SearchQuery", query);
  if (status !== undefined) params.append("Status", status.toString());

  const response = await api.get(`VaccinationResults/customer?${params.toString()}`);
  return response.data;
};

const GetLastByCustomerNVaccine = async (
  CustomerId: string,
  VaccineId: string
) : Promise<VaccinationResult> => {
  const response = await api.get(
    `VaccinationResults/get-by-customer-vaccine?customerId=${CustomerId}&vaccineId=${VaccineId}`
  );
  return response.data;
};


const GetNextVaccinationResult = async (res: VaccinationResult) => {
  return await GetVaccinationResultsFilter(
  1,
  1,
  res.next_Injection_Date, // FromInjectDate?: string,
  undefined, // ToInjectDate?: string,
  undefined, // Prevention
  undefined, // VaccineTypeId?: string,
  res.customer_Id, // CustomerId?: string,
  res.vaccine_Id, // VaccineId?: string,
  undefined, // Status?: string,
  (res.injection_Number)? (res.injection_Number + 1) + "" : undefined,

  )
};

const VaccinationResultService = {
  GetVaccinationResults,
  GetVaccinationResultsPaged,
  GetVaccinationResultsFilter,
  GetRangeYear,
  UpdateStatus,
  GetLatestVaccinationResult,
  CreateVaccinationResult,
  UpdateVaccinationResult,
  GetVaccinationResultById,
  GetByCustomerId,
  GetLastByCustomerNVaccine,
  GetNextVaccinationResult,
}


export default VaccinationResultService;
