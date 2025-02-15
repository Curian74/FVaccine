import { UserRole } from '@/types/userRole'
import { useState } from 'react'
import { Dropdown, DropdownProps } from 'semantic-ui-react'

const options = [
  { key: UserRole.Customer, text: 'Customer', value: UserRole.Customer },
  { key: UserRole.Employee, text: 'Employee', value: UserRole.Employee },
  { key: UserRole.Admin, text: 'Admin', value: UserRole.Admin },
]

const RoleSelector = (
  props: {
    roles?: number[],
    onChange?: (value: number[]) => void,
    readOnly?: boolean,
  }
) => {
  const [roles, setRoles] = useState<number[]>(props.roles ?? [])

  const handleChange = (v: DropdownProps) => {
    const value = v.value
    if (value instanceof Array) {
      setRoles(value as number[])
      if (props.onChange) props.onChange(value as number[])
    }
  }

  return (
    <Dropdown
      className="w-full"
      placeholder='Select roles'
      multiple
      selection
      options={options}
      value={roles}
      onChange={(_, v) => { handleChange(v) }}
      labeled
      disabled={props.readOnly}
    />
  )
}

export default RoleSelector
