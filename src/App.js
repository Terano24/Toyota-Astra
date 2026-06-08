import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './components/auth/login';
import ForgotPassword from './components/auth/forgot-password';
import MainLayout from './components/common/MainLayout'; // Import the new layout
import LandingPage from './components/customer/LandingPage';
import ResetPassword from './components/auth/reset-password';

import ZenixDetail from './components/customer/ZenixDetail';
import RushDetail from './components/customer/RushDetail';
import ZenixRebornDetail from './components/customer/ZenixRebornDetail';
import AvanzaDetail from './components/customer/AvanzaDetail';
import AgyaDetail from './components/customer/AgyaDetail';
import AgyaGRDetail from './components/customer/AgyaGRDetail';
import AlphardDetail from './components/customer/AlphardDetail';
import CalyaDetail from './components/customer/CalyaDetail';
import CamryDetail from './components/customer/CamryDetail';
import CamryHybridDetail from './components/customer/CamryHybridDetail';
import CorollaAltisDetail from './components/customer/CorollaAltisDetail';
import CorollaCrossDetail from './components/customer/CorollaCrossDetail';
import DynaDetail from './components/customer/DynaDetail';
import Fortuner4x2Detail from './components/customer/Fortuner4x2Detail';
import Fortuner4x4Detail from './components/customer/Fortuner4x4Detail';
import GR86Detail from './components/customer/GR86Detail';
import Bz4XDetail from './components/customer/Bz4XDetail';
import GRCorollaDetail from './components/customer/GRCorollaDetail';
import Hilux4x4Detail from './components/customer/Hilux4x4Detail';
import Hilux4x2Detail from './components/customer/Hilux4x2Detail';
import HiaceDetail from './components/customer/HiaceDetail';
import HiluxRanggaDetail from './components/customer/HiluxRanggaDetail';
import LandCruiserDetail from './components/customer/LandCruiserDetail';
import RaizeGRSportDetail from './components/customer/RaizeGRSportDetail';
import RaizeDetail from './components/customer/RaizeDetail';
import VelfireDetail from './components/customer/VelfireDetail';
import VoxyDetail from './components/customer/VoxyDetail';
import YarisCrossDetail from './components/customer/YarisCrossDetail';
import YarisDetail from './components/customer/YarisDetail';
import YarisCrossHybridDetail from './components/customer/YarisCrossHybridDetail';
import SupraDetail from './components/customer/SupraDetail';
import VelozDetail from './components/customer/VelozDetail';
import ViosDetail from './components/customer/ViosDetail';
import InnovaCVTDetail from './components/customer/InnovaCVTDetail';
import ProductListAdmin from './components/admin/ProductListAdmin';
import Signup from './components/auth/Signup';
import AdminProductEdit from './components/admin/AdminProductEdit';
import ApproveSignup from './components/admin/ApproveSignup';
import SalesDashboard from './components/salesman/SalesDashboard';
import ChatInterface from './components/salesman/ChatInterface';
import Auto2000Team from './components/salesman/Auto2000Team';
import SalesGuidesManager from './components/admin/SalesGuidesManager';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/dashboard';
import ProfileEdit from './components/encrypted-dashboard/ProfileEdit';
import CarVarietyManager from './components/admin/CarVarietyManager';
import SalesmenManagement from './components/admin/SalesmenManagement';
import ProductSyncTool from './components/admin/ProductSyncTool';


import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';

function App() {

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen overflow-x-hidden">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          
          
          {/* Public routes with MainLayout (Navbar and Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/zenix" element={<ZenixDetail />} />
            <Route path="/rush" element={<RushDetail />} />
            <Route path="/innovareborn" element={<ZenixRebornDetail />} />
            <Route path="/avanza" element={<AvanzaDetail />} />
            <Route path="/agya" element={<AgyaDetail />} />
            <Route path="/agya-gr" element={<AgyaGRDetail />} />
            <Route path="/alphard" element={<AlphardDetail />} />
            <Route path="/calya" element={<CalyaDetail />} />
            <Route path="/camry" element={<CamryDetail />} />
            <Route path="/camry-hybrid" element={<CamryHybridDetail />} />
            <Route path="/corolla-altis" element={<CorollaAltisDetail />} />
            <Route path="/corolla-cross" element={<CorollaCrossDetail />} />
            <Route path="/dyna" element={<DynaDetail />} />
            <Route path="/fortuner-4x2" element={<Fortuner4x2Detail />} />
            <Route path="/fortuner-4x4" element={<Fortuner4x4Detail />} />
            <Route path="/gr86" element={<GR86Detail />} />
            <Route path="/bz4x" element={<Bz4XDetail />} />
            <Route path="/gr-corolla" element={<GRCorollaDetail />} />
            <Route path="/hilux-4x4" element={<Hilux4x4Detail />} />
            <Route path="/hilux-4x2" element={<Hilux4x2Detail />} />
            <Route path="/hiace" element={<HiaceDetail />} />
            <Route path="/hilux-rangga" element={<HiluxRanggaDetail />} />
            <Route path="/land-cruiser" element={<LandCruiserDetail />} />
            <Route path="/raize-gr-sport" element={<RaizeGRSportDetail />} />
            <Route path="/raize" element={<RaizeDetail />} />
            <Route path="/velfire" element={<VelfireDetail />} />
            <Route path="/voxy" element={<VoxyDetail />} />
            <Route path="/yaris-cross" element={<YarisCrossDetail />} />
            <Route path="/yaris" element={<YarisDetail />} />
            <Route path="/yaris-cross-hybrid" element={<YarisCrossHybridDetail />} />
            <Route path="/supra" element={<SupraDetail />} />
            <Route path="/veloz" element={<VelozDetail />} />
            <Route path="/vios" element={<ViosDetail />} />
            <Route path="/InnovaCVT" element={<InnovaCVTDetail />} />
          </Route>

          
          {/* Protected Sales routes */}
          <Route 
            element={
              <ProtectedRoute>
                <SalesDashboard>
                  <Outlet/>
                </SalesDashboard>
              </ProtectedRoute>
            }
          >
            <Route path="/encrypted-dashboard" element={<AdminDashboard />} />
            <Route path="/encrypted-dashboard/chat" element={<ChatInterface />} />
            <Route path="/encrypted-dashboard/guides" element={<SalesGuidesManager readOnly />} />
            <Route path="/encrypted-dashboard/team" element={<Auto2000Team />} />
            <Route path="/encrypted-dashboard/profile" element={<ProfileEdit />} />
            
          </Route>
          
          {/* Admin routes */}
          <Route 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
            <Route path="/admin/products" element={<ProductListAdmin />} />
            <Route path="/admin/products/edit/:id" element={<AdminProductEdit />} />
            <Route path="/admin/approve-signups" element={<ApproveSignup />} />
            <Route path="/admin/sales-guides" element={<SalesGuidesManager />} />
            <Route path="/admin/salesmen-management" element={<SalesmenManagement />} />
            <Route path="/admin/car-variety-management" element={<CarVarietyManager />} />
            <Route path="/admin/product-sync" element={<ProductSyncTool />} />
            
          </Route>
          
          {/* Catch all other routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default App;
