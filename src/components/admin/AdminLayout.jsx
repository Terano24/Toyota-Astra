import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import DashboardLayout from '../common/DashboardLayout';

const AdminLayout = () => {
  const location = useLocation();

  const adminNavLinks = [
    { to: '/admin-dashboard', label: 'Dashboard' },
    { to: '/admin/sales-guides', label: 'Manage Sales Guides' },
    { to: '/admin/salesmen-management', label: 'Salesmen Management' },
    { to: '/admin/products', label: 'Product Management' },
    { to: '/admin/car-variety-management', label: 'Manajemen Varietas Mobil' },
  ];

  const getPageTitle = () => {
    const currentLink = adminNavLinks.find(link => link.to === location.pathname);
    return currentLink ? currentLink.label : 'Admin';
  };

  return (
    <DashboardLayout 
      navLinks={adminNavLinks} 
      pageTitle={getPageTitle()}
      logoText="Admin Panel"
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminLayout;
