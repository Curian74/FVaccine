import { ChangePassFormData, Employee } from "@/types/employee";
import api from "./api";

const GetAllEmployees = async (query: object) => {
  const response = await api.get(`/Employees`, {
    params: query,
  });
  return response.data;
};

const ChangeEmployeeStatus = async (employeeIds: string[]): Promise<void> => {
  await api.put(`/Employees/status`, { employeeIds });
};

const GetEmployeeByEmail = async(email: string | undefined): Promise<Employee> =>{
  const response = await api.get(`/Employees/email/${email}`);
  return response.data;
}

const calculateAge = (dob: string) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const ImportEmployee = async (formData: FormData) => {
  const response = await api.post('/Employees/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

const DownloadSampleFile = async () => {
  try {
    const response = await api.get('/Employees/download-sample', {
      responseType: 'blob', // Return the file as binary large obj
    });

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(new Blob([response.data]));
    link.setAttribute('download', 'ImportEmployee.xlsx'); // Set the filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

const GetEmployeeById = async(id: string | undefined): Promise<Employee> =>{
  const response = await api.get(`/Employees/${id}`);
  return response.data;
}

const ChangeEmployeePassword = async (passwordData: ChangePassFormData) => {
  const response = await api.put(`/Employees/change-password`, passwordData)

  return response.data;
}

const EmployeeService = {
  GetAllEmployees,
  calculateAge,
  ChangeEmployeeStatus,
  ImportEmployee,
  DownloadSampleFile,
  GetEmployeeByEmail,
  GetEmployeeById,
  ChangeEmployeePassword,
};

export default EmployeeService;
