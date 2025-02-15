import { Vaccine } from "./vaccine"
import { Place } from "./place"

export interface Schedule {
  description: string,
  end_Date?: string,
  place_Id: string,
  place?: Place,
  start_Date?: string,
  vaccine_Id: string,
  vaccine?: Vaccine,
  id: string
}
