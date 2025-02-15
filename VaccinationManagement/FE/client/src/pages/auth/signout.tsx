import { AuthActionType } from "@/contexts/auth/reduce";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SignOut: React.FC = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    dispatch({ type: AuthActionType.SIGN_OUT, payload: { user: null } });

    localStorage.removeItem("jwtToken")
    localStorage.removeItem("username")
    localStorage.removeItem("email")
    navigate("/auth", { replace: true });
  }, [dispatch, navigate]);

  return null;
};

export default SignOut;

