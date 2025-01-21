import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { MetaTags } from './components/MetaTags';
import { Toaster } from 'react-hot-toast';
import { UsersProvider } from './context/UsersContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Calculator from './pages/Calculator';
import { Cost } from './pages/Cost';
import { Systems } from './pages/Systems';
import { Compare } from './pages/Compare';
import { AdminSystems } from './pages/AdminSystems';
import { AdminUsers } from './pages/AdminUsers';
import { AdminModules } from './pages/AdminModules';
import { AdminModuleFields } from './pages/AdminModuleFields';
import { EditorSystems } from './pages/EditorSystems';
import { EditorUsers } from './pages/EditorUsers';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RegistrationSuccess } from './pages/RegistrationSuccess';
import { SystemForm } from './pages/SystemForm';
import { Companies } from './pages/Companies';
import { AdminCompanies } from './pages/AdminCompanies';
import { CompanyDetail } from './pages/CompanyDetail';
import Home from './pages/Home';
import AdminHome from './pages/AdminHome';
import PartnersPage from './pages/Partnerzy';
import PartnerDetailPage from './pages/Partnerzy/[slug]';
import AdminPartners from './pages/AdminPartners';
import SlownikErp from './pages/SlownikErp';
import SlownikErpTerm from './pages/SlownikErpTerm';
import AdminSlownikErp from './pages/AdminSlownikErp';
import AdminSlownikErpBanners from './pages/AdminSlownikErpBanners';
import AdminSEO from './pages/AdminSEO';
import AdminCompanyModules from './pages/AdminCompanyModules';
import AdminCompanyModuleFields from './pages/AdminCompanyModuleFields';
import AdminCompanyFields from './pages/AdminCompanyFields';

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <UsersProvider>
          <ComparisonProvider>
            <div className="min-h-screen flex flex-col">
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  className: 'bg-white text-apple-gray-700 text-base px-8 py-4 shadow-lg rounded-xl border border-apple-gray-100 min-w-[300px] font-medium',
                  success: {
                    icon: '✓',
                    className: 'bg-white text-apple-gray-700 text-base px-8 py-4 shadow-lg rounded-xl border border-apple-gray-100 min-w-[300px] font-medium',
                  },
                  error: {
                    icon: '✕',
                    className: 'bg-white text-red-600 text-base px-8 py-4 shadow-lg rounded-xl border border-red-100 min-w-[300px] font-medium',
                  },
                }}
                containerStyle={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <MetaTags />
              <Navigation />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/kalkulator" element={<Calculator />} />
                <Route path="/koszt-wdrozenia-erp" element={<Cost />} />
                <Route path="/systemy-erp" element={<Systems />} />
                <Route path="/porownaj-systemy-erp" element={<Compare />} />
                <Route path="/partnerzy" element={<PartnersPage />} />
                <Route path="/partnerzy/:slug" element={<PartnerDetailPage />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/register" element={<Register />} />
                <Route path="/rejestracja/sukces" element={<RegistrationSuccess />} />
                <Route 
                  path="/admin/home" 
                  element={
                    <ProtectedRoute>
                      <AdminHome />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/systems/new" 
                  element={
                    <ProtectedRoute>
                      <SystemForm mode="create" />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/systemy" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminSystems />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/modules" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminModules />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/modules/:moduleId/fields" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminModuleFields />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminUsers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/partners" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminPartners />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/slownik-erp" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminSlownikErp />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/slownik-erp/banery" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminSlownikErpBanners />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/seo" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminSEO />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/companies" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCompanies />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/company-modules" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCompanyModules />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/company-modules/:moduleId/fields" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCompanyModuleFields />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/company-modules/:moduleId/company-fields" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminCompanyFields />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/editor">
                  <Route 
                    path="systems" 
                    element={
                      <ProtectedRoute allowEditor>
                        <EditorSystems />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="companies" 
                    element={
                      <ProtectedRoute allowEditor>
                        <AdminCompanies />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="users"
                    element={
                      <ProtectedRoute requireAdmin allowEditor requireUserView>
                        <EditorUsers />
                      </ProtectedRoute>
                    }
                  />
                </Route>
                <Route path="/slownik-erp" element={<SlownikErp />} />
                <Route path="/slownik-erp/:slug" element={<SlownikErpTerm />} />
                <Route 
                  path="/companies" 
                  element={
                    <ProtectedRoute>
                      <Companies />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/companies/:slug" 
                  element={
                    <ProtectedRoute>
                      <CompanyDetail />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Footer />
            </div>
          </ComparisonProvider>
        </UsersProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;