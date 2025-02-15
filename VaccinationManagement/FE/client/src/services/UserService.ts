import { User } from "@/types/user"
import api from "./api"
const GetProfile = async (email: string): Promise<User> => {
    const response = await api.get<User>(`/Auth/profile?email=${email}`)
    return response.data;
}

const UserService = {
    GetProfile
}
export default UserService