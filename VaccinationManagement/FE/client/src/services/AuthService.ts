import { UserLogin } from "@/types/user";
import api from "./api"
import {  ResponseWith } from "@/types/response";

const login = async (email: string, password: string) => {
    const response = await api.post<ResponseWith<UserLogin>>("/Auth/login",
        { email, password });
    localStorage.setItem('username', response.data.data.username)
    localStorage.setItem('email', response.data.data.email)
    localStorage.setItem('jwtToken', response.data.data.accessToken)
    return response.data;
}
const forgotPassword = async (email: string) => {
    await api.post("/auth/forgot-password?email=" + email);
  };

const AuthService = {
    login,
    forgotPassword,
}
export default AuthService
