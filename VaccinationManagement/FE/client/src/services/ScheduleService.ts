import api from "./api"
import { Schedule } from "@/types/schedule";
import { ScheduleStatus } from "@/types/scheduleStatus";

const GetSchedules = async () => {
  const response = await api.get("Schedules");
  return response.data;
};

const GetScheduleById = async (id: string) => {
  const response = await api.get("Schedules/" + id);
  return response.data;
};

const GetSchedulesPaged = async (pageIndex = 1, PageSize = 10, SearchQuery?: string, status?: number, Vaccine_Id?: string) => {
  let requestString = "Schedules/paged"
  if (status == ScheduleStatus.NotYet) requestString += "/notyet"
  else if (status == ScheduleStatus.Open) requestString += "/open"
  else if (status == ScheduleStatus.Over) requestString += "/over"
  requestString += '?'

  const params: Record<string, string> = {
    pageIndex: pageIndex.toString(),
    PageSize: PageSize.toString(),
  };

  if (SearchQuery) params.SearchQuery = SearchQuery;
  if (Vaccine_Id) params.Vaccine_Id = Vaccine_Id;

  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(requestString + queryString);
  return response.data;
};

const GetLatestSchedule = async () => {
  const response = await api.get("Schedules/latest");
  return response.data;
};

const CreateSchedule = async (schedule: Schedule): Promise<Schedule> => {
  const response = await api.post("/Schedules", schedule);
  return response.data;
}

const UpdateSchedule = async (schedule: Schedule): Promise<Schedule> => {
  const response = await api.put("/Schedules", schedule);
  return response.data;
}

const GetScheduleByVaccineId = async (
  vaccineId: string,
  pageIndex: number,
  pageSize: number,
  keyword: string) => {
  const response = await api.get(`Schedules/get-by-vaccineId?VaccineId=${vaccineId}&PageIndex=${pageIndex}&pageSize=${pageSize}&SearchTerm=${keyword}`);
  return response.data;
}

const ScheduleService = {
  GetSchedules,
  GetSchedulesPaged,
  GetLatestSchedule,
  CreateSchedule,
  GetScheduleById,
  UpdateSchedule,
  GetScheduleByVaccineId,
}

export default ScheduleService
