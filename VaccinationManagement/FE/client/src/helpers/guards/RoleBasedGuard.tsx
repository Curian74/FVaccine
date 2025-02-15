import Loading from "@/components/layout/Loading";
import UserService from "@/services/UserService";
import { User } from "@/types/user";
import { FC, ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Roles } from "../constants/constants";

export interface RoleBasedGuardProps {
  accessibleRoles: Array<string>;
  children: ReactNode;
}

const RoleBasedGuard: FC<RoleBasedGuardProps> = ({
  children,
  accessibleRoles
}) => {

  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const email = localStorage.getItem('email')!;
        const profile = await UserService.GetProfile(email);
        setUser(profile);
        console.log(profile);

      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
      finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (isLoading) return <Loading />
  const isRoleMatched = accessibleRoles.includes(Roles[user?.roleId || 0]);
  const restrictedPaths = ["add", "update", 'report', "customer/create", "import", "new-employee"];
  const isRestricted = restrictedPaths.some((path) => location.pathname.includes(path));
  if (isRestricted && Roles[user?.roleId || 0] === "Employee") return <Navigate to="/" />;
  console.log(user);
  if (!isRoleMatched) {
    if (Roles[user?.roleId || 0] === "Customer" || Roles[user?.roleId || 0] === "Guest")
      return <Navigate to="/home" />;
    else {
      return <Navigate to="/" />;

    }
  }
  return <>{children}</>;
};

export default RoleBasedGuard;
