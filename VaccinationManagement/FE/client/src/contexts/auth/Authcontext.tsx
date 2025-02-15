import { Dispatch, FC, PropsWithChildren, useEffect } from "react";
import { AuthState } from "./types";
import React from "react";
import { PayloadAction, initialize, reducer } from "./reduce";
import UserService from "@/services/UserService";

export interface AuthContextType extends AuthState {
  dispatch: Dispatch<PayloadAction<AuthState>>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null
};

export const AuthContext = React.createContext<AuthContextType>({
  ...initialState,
  dispatch: () => null
});

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [authState, dispatchAuth] = React.useReducer(reducer, initialState);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = localStorage.getItem('email') || '';
        console.log("Fetching profile for email:", email);
        const user = await UserService.GetProfile(email);
        console.log("Fetched user profile:", user);
  
        if (user) {
          dispatchAuth(initialize({ isAuthenticated: true, user }));
        } else {
          throw new Error("User not found");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        dispatchAuth(initialize({ isAuthenticated: false, user: null }));
      }
    };
  
    fetchProfile();
  }, []);
  

  return (
    <AuthContext.Provider value={{ ...authState, dispatch: dispatchAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
