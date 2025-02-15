import Sidebar from "@/components/layout/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import { Container, Header} from "semantic-ui-react";

const Dashboard = () => {
  const location = useLocation();

  return (
    <>
      <Sidebar
        animation='push'
        direction='left'
        visible={true}
      >
        <Container>
          {location.pathname === '/dashboard' && (
            <div className="mt-3">
            <Header as='h2' textAlign="center">WELCOME TO VACCINE MANAGEMENT SYSTEM</Header>
            </div>
          )}
          <div className="mt-5"></div>
            <div className="mt-5 h-[calc(100vh)] overflow-y-auto p-4">
            <Outlet />
          </div>
        </Container>
      </Sidebar>
    </>
  );
};
export default Dashboard
