export interface Vaccine {
    id: string;
    vaccine_Name: string;
    vaccine_Type_Id: string;
    number_Of_Injection: number | null;
    usage: string;
    indication: string;
    contraindication: string;
    time_Begin_Next_Injection: string;
    time_End_Next_Injection: string;
    time_Between_Injections: number | null;
    required_Injections: number;
    origin: string;
    status: boolean;
    purchase_Price: number | null;
    selling_Price: number | null;
    image: string;
    description: string;
}
export interface VaccineReport {
    id: string;
    vaccine_Name: string;
    vaccine_Type_Name: string;
    number_Of_Injection: number | null;
    time_Begin_Next_Injection: string;
    time_End_Next_Injection: string;
    origin: string;
    purchase_Price: number;
    selling_Price: number;
}

export interface MonthlySummary {
    month: number,
    totalVaccines: number,
}

