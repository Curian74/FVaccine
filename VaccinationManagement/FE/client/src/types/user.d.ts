export interface User {
  username: string;
  email: string;
  roleId: number;
  image?: string;
}

export interface UserLogin {
  email: string
  username: string
  accessToken: string
  refreshToken: string
  accessTokenExpiresInMinutes: int
  refreshTokenExpiresInDays: int
}

export interface Customer {
  id: string;
  address: string;
  date_Of_Birth: string;
  full_Name: string;
  email: string;
  gender: number | null;
  phone: string;
  identity_Card: string;
  username: string;
  password: string;
  status: boolean;
  province: string;
  district: string;
  ward: string;
  image: string;
}
export interface CustomerReporting {
  id: string;
  address: string;
  date_Of_Birth: string;
  full_Name: string;
  identity_Card: string;
  number_Of_Injection: number
}