import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute: React.FC = () => {
  const token = localStorage.getItem('jwtToken');
  return token ? <Outlet /> : <Navigate to="/auth" />;
};

export default PrivateRoute;
