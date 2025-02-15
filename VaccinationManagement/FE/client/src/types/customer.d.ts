import { VaccinationResult } from "./vaccinationResult"

interface Customer {
  address: string,
  date_Of_Birth: Date,
  full_Name: string,
  email: string,
  gender: number?,
  phone: string,
  identity_Card: string,
  password: string,
  username: string,
  injection_Results: VaccinationResult[]?
}

export interface UpdateProfileRequest {
  id?: string;
  username?: string;
  full_Name?: string;
  phone?: string;
  date_Of_Birth?: string;
  identity_Card?: string;
  gender?: number;
  province?: string;
  district?: string;
  ward?: string;
  address?: string;
  status?: boolean;
  image?: string;
}
