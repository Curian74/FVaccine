import { Customer } from "@/types/user";
import api from "./api";
import { ChangePassFormData } from "@/types/employee";
import {UpdateProfileRequest} from "@/types/customer";

const GetListCustomer = async (page: number, pageSize: number, searchTerm: string, isActive: boolean) => {
    const response = await api.get(`/Customer/query`, {
        params: { page, pageSize, searchTerm, isActive }
    });
    return response.data;
};

const GetLastCustomer = async () => {
    const response = await api.get(`/Customer/get-last-customer`);
    return response.data;
};

const CheckUserExistence = async (username: string, email: string, phone: string) => {
    const response = await api.get(`/Customer/check-existence`, {
        params: { username, email, phone }
    });
    return response.data;
};

const CreateCustomer = async (customer: Customer): Promise<Customer> => {
    console.log(customer);
    const response = await api.post("/Customer", customer);
    return response.data;
};

const UpdateCustomer = async (customer: Customer): Promise<Customer> => {
    const response = await api.put(`/Customer`, customer);
    return response.data;
};

const UpdateProfile = async (customer: UpdateProfileRequest): Promise<Customer> => {
    const response = await api.put(`/Customer`, customer);
    return response.data;
};

const ChangePassword = async (passwordData: ChangePassFormData) => {
    const response = await api.put(`/Customer/change-password`, passwordData);
    return response;
};

const MakeCustomersInactive = async (customerIds: string[]): Promise<void> => {
    await api.put(`/Customer/inactive`, { customerIds });
};

const UploadImage = async (img: File) => {
    const formData = new FormData();
    formData.append('file', img);
    const response = await api.post('/Customer/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

const CheckPhoneOrEmailExist = async (
    email?: string,
    phone?: string,
    id? : string) => {
    const response = await api.post('/Customer/check-phone-email', { email, phone, id });
    return response.data;
}


const GetCustomersFilter = async (
    pageIndex = 1,
    pageSize = 10,
    FromDOB?: string,
    ToDOB?: string,
    FullName?: string,
    Address?: string,
) => {
    const params: Record<string, string> = {
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
    };

    if (FromDOB) params.FromDOB = FromDOB;
    if (ToDOB) params.ToDOB = ToDOB;
    if (FullName) params.FullName = FullName;
    if (Address) params.Address = Address;

    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`Customer/filter?${queryString}`);
    return response.data;
};

const GetCustomerByEmail = async (email: string): Promise<Customer> => {
    const response = await api.get(`/Customer/get-by-email?email=${email}`);
    return response.data;
}

const ChangeEmail = async (oldEmail: string, newEmail: string) => {
    const response = await api.put(`/Customer/change-email`, {
        oldEmail: oldEmail,
        newEmail: newEmail,
    })
    return response.data;
}

const CheckUsername = async (
    username?: string,
    id? : string,
    temp? : string) => {
    const response = await api.post('/Customer/check-username', { username, id, temp });
    return response.data;
}

const CustomerService = {
    CreateCustomer,
    GetLastCustomer,
    CheckUserExistence,
    UpdateCustomer,
    ChangePassword,
    MakeCustomersInactive,
    GetListCustomer,
    GetCustomersFilter,
    GetCustomerByEmail,
    UploadImage,
    ChangeEmail,
    CheckPhoneOrEmailExist,
    UpdateProfile,
    CheckUsername,
};

export default CustomerService;
