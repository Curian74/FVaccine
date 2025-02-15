import { ReactNode } from "react";

export interface dropdownEntry {
  key: string,
  text?: string,
  value?: string,
  content?: ReactNode,
  disabled?: boolean,
}

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

export const dateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export { formatDate }
