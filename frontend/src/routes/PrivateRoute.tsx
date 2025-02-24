import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import React from 'react';

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  const auth = useContext(AuthContext);

  return auth?.token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
