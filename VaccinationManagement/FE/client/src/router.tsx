import { lazy } from 'react';
import React from 'react';
import Loadable from './helpers/loading/Loadable';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ListVaccine from './pages/manager/vaccine';
import PrivateRoute from './contexts/auth/PrivateRoute';
import AddVaccine from './pages/manager/vaccine/createVaccine';
import UpdateVaccine from './pages/manager/vaccine/updateVaccine';
import ImportVaccine from './pages/manager/vaccine/importVaccine';
import CreateCustomer from './pages/manager/customer/createCustomer';
import ListCustomer from './pages/manager/customer';
import UpdateCustomer from './pages/manager/customer/updateCustomer';
import AuthLayout from "@/components/layout/AuthLayout";
import ImportEmployees from './pages/manager/employee/importEmployees';
import RoleBasedGuard from './helpers/guards/RoleBasedGuard';
import NoPremission from './components/layout/NoPermission';
import DistributeVaccine from './pages/manager/vaccine/distributeVaccine';
import Layout from './components/layout/Layout';
import VaccineDetail from './pages/home/vaccine/vaccineDetail';
import NewsTypePage from './pages/home/newsType';
import NewsDetailPage from './pages/home/newsType/newsDetail';
import VaccineByTypePage from './pages/home/vaccineType';
import VisionPage from './pages/home/aboutUs/vision';
import MissionPage from './pages/home/aboutUs/mission';
import GuaranteePage from './pages/home/aboutUs/guarantee';
import Register from './pages/auth/register';
import Profile from './pages/home/user/profile';
import ScheduleInjections from './pages/home/bookAppointment/schedule';
import ChangeEmailSuccess from './components/layout/customer/ChangeEmailSuccess';
import ChangeEmailFail from './components/layout/customer/ChangEmailFail';
import { useAuth } from './hooks/useAuth';
const SignIn = Loadable(lazy(() => import("@/pages/auth/signin")));
const SignOut = Loadable(lazy(() => import("@/pages/auth/signout")));
const ForgotPassword = Loadable(lazy(() => import("@/pages/auth/forgotPassword")));
const Home = Loadable(lazy(() => import("@/pages/manager/home")));
const HomePage = Loadable(lazy(() => import("@/pages/home")));
const VaccineType = Loadable(lazy(() => import("@/pages/manager/vaccineType")));
const AddVaccineType = Loadable(lazy(() => import("@/pages/manager/vaccineType/createVaccineType")));
const UpdateVaccineType = Loadable(lazy(() => import("@/pages/manager/vaccineType/updateVaccineType")));
const Dashboard = Loadable(lazy(() => import("@/pages/manager/dashboard")));
const ScheduleList = Loadable(lazy(() => import("@/pages/manager/schedule")));
const AddSchedule = Loadable(lazy(() => import("@/pages/manager/schedule/createSchedule")));
const UpdateSchedule = Loadable(lazy(() => import("@/pages/manager/schedule/updateSchedule")));
const InjectionReport = Loadable(lazy(() => import("@/pages/manager/report/index")));
const CustomerReport = Loadable(lazy(() => import("@/pages/manager/report/customerReport")));
const VaccineReport = Loadable(lazy(() => import("@/pages/manager/report/vaccineReport")));
const VaccinationResultList = Loadable(lazy(() => import("@/pages/manager/vaccinationResult")));
const CreateVaccinationResult = Loadable(lazy(() => import("@/pages/manager/vaccinationResult/createVaccinationResult")));
const UpdateVaccinationResult = Loadable(lazy(() => import("@/pages/manager/vaccinationResult/updateVaccinationResult")));
const EmpList = Loadable(lazy(() => import("@/pages/manager/employee/employeeList")));

const MenuList = Loadable(lazy(() => import("@/pages/manager/menu")));
// const AddSchedule = Loadable(lazy(() => import("@/pages/manager/schedule/createSchedule")));
// const UpdateSchedule = Loadable(lazy(() => import("@/pages/manager/schedule/updateSchedule")));
const CreateEmployee = Loadable(
  lazy(() => import("@/pages/manager/employee/createEmployee"))
);
const UpdateEmployee = Loadable(
  lazy(() => import("@/pages/manager/employee/updateEmployee"))
);
const News = Loadable(lazy(() => import("@/pages/manager/news/index")));
const CreateNews = Loadable(lazy(() => import("@/pages/manager/news/createNews")));
const UpdateNews = Loadable(lazy(() => import("@/pages/manager/news/updateNews")));
const BookAppointment = Loadable(lazy(() => import("@/pages/home/bookAppointment")));
const MyRouterProvider: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {!isAuthenticated &&
          <>
            <Route path="auth" element={<AuthLayout />}>
              <Route index element={<SignIn />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>
            <Route path='register' element={<Register />} />
          </>
        }
        <Route path="sign-out" element={<SignOut />} />

        <Route element={<PrivateRoute />}>
          <Route element={<RoleBasedGuard accessibleRoles={["Admin", "Employee"]}><Outlet /></RoleBasedGuard>}>
            <Route path="" element={<Dashboard />}>
              <Route path="homepage" element={<Home />} />
              <Route path="vaccineType" element={<VaccineType />} />
              <Route path="addVaccineType" element={<AddVaccineType />} />
              <Route path="updateVaccineType/:id" element={<UpdateVaccineType />} />
              <Route path="vaccine" element={<ListVaccine />} />
              <Route path="vaccine/add" element={<AddVaccine />} />
              <Route path="/vaccine/update" element={<UpdateVaccine />} />
              <Route path="/vaccine/import" element={<ImportVaccine />} />
              <Route path="/vaccine/distribute" element={<DistributeVaccine />} />
              <Route path="customer" element={<ListCustomer />} />
              <Route path="/customer/create" element={<CreateCustomer />} />
              <Route path="/customer/update" element={<UpdateCustomer />} />
              <Route path="schedule">
                <Route index element={<ScheduleList />} />
                <Route path="create" element={<AddSchedule />} />
                <Route path="edit/:id" element={<UpdateSchedule />} />
              </Route>
              <Route path="report">
                <Route index element={<InjectionReport />}></Route>
                <Route path="vaccineReport" element={<VaccineReport />}></Route>
                <Route path="customerReport" element={<CustomerReport />}></Route>
                <Route path="vaccinationResult">
                  <Route index element={<VaccinationResultList />} />
                </Route>
              </Route>
              <Route path="employee" element={<EmpList />} />
              <Route path="new-employee" element={<CreateEmployee />} />
              <Route path="/update-employee/:id" element={<UpdateEmployee />} />
              <Route path="/employee/import" element={<ImportEmployees />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/create" element={<CreateNews />} />
              <Route path="vaccinationResult">
                <Route index element={<VaccinationResultList />} />
                <Route path="create" element={<CreateVaccinationResult />} />
                <Route path="edit/:id" element={<UpdateVaccinationResult />} />
                <Route path="increment/:id" element={<UpdateVaccinationResult increment />} />
              </Route>
              <Route path="/news/update/:id" element={<UpdateNews />} />

              <Route path="menu">
                <Route index element={<MenuList />} />
              </Route>
            </Route>
            <Route
              path="*"
              element={
                <Navigate to="/" replace />
              }
            />
          </Route>
          <Route path='change-email-success' element={<ChangeEmailSuccess />} />
          <Route path='change-email-fail' element={<ChangeEmailFail />} />
        </Route>
        <Route element={<RoleBasedGuard accessibleRoles={["Customer", "Guest"]}><Outlet /></RoleBasedGuard>}>
          <Route path="home" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="schedule" element={<ScheduleInjections />} />
            <Route path='vaccine-detail/:vaccineId' element={<VaccineDetail />}></Route>
            <Route path='newsType/:newsTypeId' element={<NewsTypePage />}></Route>
            <Route path='news/:newsId' element={<NewsDetailPage />}></Route>
            <Route path='vaccineType/:vaccineTypeId?' element={<VaccineByTypePage />}></Route>
            <Route path='vision' element={<VisionPage />} />
            <Route path='mission' element={<MissionPage />} />
            <Route path='guarantee' element={<GuaranteePage />} />
            <Route path='profile' element={<Profile/>}></Route>
            <Route
              path="*"
              element={
                <Navigate to="/home" replace />
              }
            />
          </Route>
          <Route path='no-premission' element={<NoPremission />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default MyRouterProvider;
