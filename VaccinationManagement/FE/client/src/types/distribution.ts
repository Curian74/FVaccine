import { Vaccine } from "./vaccine";
import { Place } from "./place";

export interface Distribution {
    id: string;
    vaccine_Id: string;
    place_Id: string;
    quantity_Imported: number | null;
    quantity_Injected: number;
    date_Import: string;
    vaccine?: Vaccine;
    place?: Place;
}
