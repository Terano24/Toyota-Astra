import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../common/DashboardLayout';

const SalesDashboard = ({ children }) => {
  const location = useLocation();

  const salesNavLinks = [
    { to: '/encrypted-dashboard', label: 'Dashboard' },
    { to: '/encrypted-dashboard/chat', label: 'Live Chat' },
    { to: '/encrypted-dashboard/guides', label: 'Sales Video Learning' },
    { to: '/encrypted-dashboard/team', label: 'Auto2000 Team' },
    { to: '/encrypted-dashboard/profile', label: 'My Profile' },
  ];

  const getPageTitle = () => {
    const currentLink = salesNavLinks.find(link => link.to === location.pathname);
    return currentLink ? currentLink.label : 'Sales';
  };

  return (
    <DashboardLayout
      navLinks={salesNavLinks}
      pageTitle={getPageTitle()}
      logoText="Sales Dashboard"
    >
      {children}
    </DashboardLayout>
  );
};

export default SalesDashboard;
