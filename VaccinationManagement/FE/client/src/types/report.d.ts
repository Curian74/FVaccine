export interface AnnualVaccineCustomer {
    vaccineName: string;
    totalInject: number;
    totalInjectionVisits: number;
}

export interface AnnualVaccineSummary {
    totalInject: number;
    totalCustomers: number;
    totalIncome: number;
}

export interface MonthlyCustomerSummary {
    month: number,
    totalInjections: number,
}
export interface MonthlyVaccineSummary {
    month: number,
    totalInjections: number,
    totalIncome: number,
}
export interface VaccineStatisticByYear{
    vaccineName: string,
    totalInjects: number,
}

export interface MonthlyInjectionSummary {
    month: number,
    totalInjections: number,
    totalNumberVisits: number,
    totalRevenue: number,
}