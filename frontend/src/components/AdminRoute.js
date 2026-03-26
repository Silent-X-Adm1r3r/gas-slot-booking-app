// AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AdminRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default AdminRoute;
