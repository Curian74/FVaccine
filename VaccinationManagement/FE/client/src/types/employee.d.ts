export interface Employee {
  id: string;
  employee_Name: string;
  username: string;
  date_Of_Birth: string;
  gender: string;
  phone: string;
  address: string;
  password: string;
  email: string;
  wardId: string;
  districtId: string;
  provinceId: string;
  positionId: string;
  roleId : number;
  image: string;
  status: boolean;
}

export interface ChangePassFormData {
  id?: string;
  currentPassword: string;
  newPassWord: string;
  confirmPassword: string;
}
