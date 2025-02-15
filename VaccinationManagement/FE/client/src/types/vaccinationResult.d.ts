import { Vaccine } from "./vaccine"
import { Customer } from "./user"
import { Place } from "./place"
import { VaccinationResultStatus } from "./vaccinationResultStatus"

export interface VaccinationResult {
  id: string,
  injection_Date?: string,
  next_Injection_Date?: string,
  number_Of_Injection?: number?,
  injection_Number?: number,
  prevention?: string,
  vaccine_Id: string,
  vaccine?: Vaccine,
  customer_Id: string,
  customer?: Customer,
  injection_Place_Id: string,
  injection_Place?: Place,
  isVaccinated: VaccinationResultStatus,
}

