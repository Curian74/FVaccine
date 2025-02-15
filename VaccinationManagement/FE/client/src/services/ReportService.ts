import { AnnualVaccineSummary, MonthlyCustomerSummary, MonthlyVaccineSummary, VaccineStatisticByYear } from "@/types/report";
import api from "./api";
import { MonthlyInjectionSummary } from "@/types/report";

const GetMonthlyCustomerSummary = async (
    year: string,
    customerId?: string)
    : Promise<MonthlyCustomerSummary[]> => {
    const response = await api.get(`Report/monthly-customer-summary?year=${year}&customerId=${customerId}`);
    console.log(response);
    console.log('data' + response.data);

    return response.data;
}
const GetMonthlyVaccineSummary = async (
    year: string,
    vaccineId?: string)
    : Promise<MonthlyVaccineSummary[]> => {
    const response = await api.get(`Report/monthly-vaccine-summary?year=${year}&vaccineId=${vaccineId}`);
    console.log(response);
    console.log('data' + response.data);

    return response.data;
}

const GetAnnualVaccines = async (
    year: string,
    customerId?: string,
) => {
    const response = await api.get(`Report/annual-vaccine?year=${year}&customerId=${customerId}`);
    return response.data;
};

const GetMonthlyInjectionSummary = async (year: string) : Promise<MonthlyInjectionSummary[]> => {
    const response = await api.get(`Report/monthly-summary?year=${year}`);
    console.log(response);
    console.log('data' + response.data);
    
    return response.data;
  }

const GetTotalCustomerUsingVaccine = async (
    year: string,
    vaccineId?: string,
) : Promise<AnnualVaccineSummary> =>{
    const response = await api.get(`Report/statistic-vaccine?year=${year}&vaccineId=${vaccineId}`);
    return response.data;
}

const GetVaccineStatisticByYear = async (year: string): Promise<VaccineStatisticByYear[]> => {
    const response = await api.get(`Report/statistic-vaccine-by-year?year=${year}`);
    return response.data;
}

const ReportService = {
    GetMonthlyCustomerSummary,
    GetMonthlyVaccineSummary,
    GetAnnualVaccines,
    GetMonthlyInjectionSummary,
    GetTotalCustomerUsingVaccine,
    GetVaccineStatisticByYear,
};
export default ReportService;