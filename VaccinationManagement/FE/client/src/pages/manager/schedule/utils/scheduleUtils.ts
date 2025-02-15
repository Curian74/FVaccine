import { ReactNode } from "react";
import { Vaccine } from "@/types/vaccine";
import { Distribution } from "@/types/distribution";

export interface dropdownEntry {
  key: string,
  text?: string,
  value?: string,
  content?: ReactNode,
  disabled?: boolean,
}

const vaccineDropdownText = (vac: Vaccine) => {
  return vac.vaccine_Name + " - " + formatDate(vac.time_Begin_Next_Injection, '/', 1) + " to " + formatDate(vac.time_End_Next_Injection, '/', 1)
}

export { vaccineDropdownText }

const distributionDropdownText = (dist: Distribution) => {
  return dist.place?.name // + " - " + formatDate(dist.date_Import, '/', 1)
}

export { distributionDropdownText }

const formatDate = (date: Date | string | undefined, divider = '-', format?: string | number) => {
  if (date) {
    const _date = new Date(date)

    if (format) {
      switch (format) {
        case 'dd-mm-yyyy':
        case 1:
          return String(_date.getDate()).padStart(2, '0') + divider + String(_date.getMonth() + 1).padStart(2, '0') + divider + _date.getFullYear()
      }
    }
    else return _date.getFullYear() + divider + String(_date.getMonth() + 1).padStart(2, '0') + divider + String(_date.getDate()).padStart(2, '0')
  }
  else return ''
}

export { formatDate }

export const dateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const distinctDistributionsByPlace = (list: Distribution[]) => {
  const placeMap = list.map(d => d.place_Id)
  return list.filter((place, index) => placeMap.indexOf(place.place_Id) === index)
}

export { distinctDistributionsByPlace }
