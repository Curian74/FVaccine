import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeService from "@/services/EmployeeService";
import { Employee } from "@/types/employee";
import message from "@/helpers/constants/message.json";
import { Checkbox } from 'semantic-ui-react'
import { RoleBasedRender } from "@/helpers/utils";
import { UserRole } from "@/types/userRole";

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [messageTitle, setMessageTitle] = useState("");
  const [status, setStatus] = useState(true);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchEmployees = async () => {
    try {
      const query = {
        name: searchQuery,
        pageIndex: currentPage,
        pageSize: pageSize,
        status: status,
      };

      const response = await EmployeeService.GetAllEmployees(query);
      setEmployees(response.employees || []);
      setTotalEmployees(response.totalEmployees || 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const navigate = useNavigate();

  const handleStatusToggle = () => {
    setStatus(!status);
    setSelectedEmployeeIds([]);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (param: string) => {
    if (selectedEmployeeIds.length == 0) {
      setMessageTitle("Warning");
      setPopupMessage(message["MSG 36"]);
      setIsModalOpen(true);
      return;
    }

    if (param === "update") {
      if (selectedEmployeeIds.length !== 1) {
        setMessageTitle("Warning");
        setPopupMessage(message["MSG 35"]);
        setIsModalOpen(true);
        return;
      }
      navigate(`/update-employee/${selectedEmployeeIds}`)
    }

    setMessageTitle("Confirmation");
    setPopupMessage(message["MSG 37"]);
    setIsModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      await EmployeeService.ChangeEmployeeStatus(selectedEmployeeIds);
      fetchEmployees();
    } catch (error) {
      console.error("Error updating employee status:", error);
    }
    setIsModalOpen(false);
    setSelectedEmployeeIds([]);
  };

  const handleSelectAll = () => {
    const allEmployeeIds = employees.map((employee) => employee.id);
    if (!isSelectAll) {
      setSelectedEmployeeIds(allEmployeeIds);
    } else {
      setSelectedEmployeeIds([]);
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleCheckboxChange = (id: string) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter((empId) => empId !== id));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, id]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedEmployeeIds([]);
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, pageSize, searchQuery, status]);

  const totalPages = Math.ceil(totalEmployees / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayCount = Math.min(pageSize, totalEmployees - startIndex);

  return (
    <div className="p-4">
      <h1 className="text-center text-2xl font-bold mb-4">EMPLOYEE LIST</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between mb-2">
          <div>
            <label htmlFor="entries" className="mr-2">Show</label>
            <select
              name="entries"
              className="border rounded p-1"
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1);
                setSelectedEmployeeIds([])
              }}
              value={pageSize}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
            <span className="ml-2">entries</span>
          </div>

          <div className="ml-auto flex items-center mr-6">
            <label className="mr-2">{status ? "Active" : "Inactive"}</label>
            <Checkbox toggle onClick={handleStatusToggle} checked={status} />
          </div>
          <input
            type="text"
            placeholder="Search by name..."
            className="border p-1 rounded"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <table className="min-w-full border-collapse table-auto">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border p-2 text-left">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={isSelectAll && selectedEmployeeIds.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="border p-2 text-left">Employee ID</th>
              <th className="border p-2 text-left">Employee Name</th>
              <th className="border p-2 text-left">Date of Birth</th>
              <th className="border p-2 text-left">Gender</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Address</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Image</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee.id} className="odd:bg-gray-100 even:bg-white">
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onChange={() => handleCheckboxChange(employee.id)}
                    />
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => navigate(`/update-employee/${employee.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {employee.id}
                    </button>
                  </td>
                  <td className="border p-2">{employee.employee_Name}</td>
                  <td className="border p-2">{employee.date_Of_Birth}</td>
                  <td className="border p-2">
                    {employee.gender == "1" ? "Male" : "Female"}
                  </td>
                  <td className="border p-2">{employee.phone}</td>
                  <td className="border p-2">{employee.address}</td>
                  <td className="border p-2 font-bold" style={{ color: employee.status ? "green" : "red" }}>
                    {employee.status ? "Active" : "Inactive"}
                  </td>
                  <td className="border p-2 min-h-28">
                    {employee.image ? (
                      <img
                        className="w-8 h-8 mx-auto rounded-full"
                        src={`${baseUrl}${employee.image}`}
                        alt="employee"
                      />
                    ) : (
                      <div className="w-14 h-14"></div>
                    )}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center text-gray-600 py-4 border">
                  {message["MSG 8"]}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <div>
            Showing {startIndex + 1} to {startIndex + displayCount} of {totalEmployees} entries
          </div>
          <nav>
            <ul className="inline-flex items-center -space-x-px">
              <li>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                >
                  «
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index}>
                  <button
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-2 leading-tight border ${currentPage === index + 1
                      ? 'bg-gray-500 text-white'
                      : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center mt-4">
        
        <RoleBasedRender render={(role) =>
          (role == UserRole.Admin) ?
            <>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            onClick={() => navigate("/new-employee")}
          >
            New Employee
          </button>
          <button
            className="px-4 py-2 bg-orange-500 text-white rounded mr-2"
            onClick={() => handleToggleStatus("update")}
          >
            Update Employee
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded mr-2"
            onClick={() => handleToggleStatus("status")}
          >
            {status ? (
              <p>Make Inactive</p>
            ) : (
              <p>Make Active</p>
            )}
          </button>

          <button
            className="px-4 py-2 bg-green-500 text-white rounded mr-2"
            onClick={() => navigate("/employee/import")}>
            Import Employees
          </button>
          </>
            :
            null
        }
        defaultRender={(error) =>
          <p className="text-red-500"> {error} </p>
        }
        />

        </div>
      </div>

      {isModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{messageTitle}</h2>
            <p className="mb-6">{popupMessage}</p>
            <div className="flex justify-end space-x-4">
              {messageTitle === "Confirmation" ? (
                <>
                  <button
                    onClick={handleStatusChange}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
