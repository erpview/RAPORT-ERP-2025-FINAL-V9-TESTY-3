import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { MetaTags } from './components/MetaTags';
import { Toaster } from 'react-hot-toast';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { UsersProvider } from './context/UsersContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useScrollToTop } from './hooks/useScrollToTop';
import Calculator from './pages/Calculator';
import { Cost } from './pages/Cost';
import { Systems } from './pages/Systems';
import SystemDetail from './pages/SystemDetail';
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
import { PendingAccount } from './pages/PendingAccount';
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
import AdminSurveyForms from './pages/AdminSurveyForms';
import AdminSurveyAssignments from './pages/AdminSurveyAssignments';
import AdminSurveyResponses from './pages/AdminSurveyResponses';
import SurveyFormEditor from './pages/SurveyFormEditor';
import { emailConfig } from './config/email';
import emailjs from '@emailjs/browser';
import { FeedbackModal } from './components/FeedbackModal';
import AuthCallback from './components/AuthCallback';

const AppContent = () => {
  const { showSurvey, closeSurvey } = useAuth();

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
        }}
      >
        <div id="recaptcha-container"></div>
      </div>
      {showSurvey && <FeedbackModal isOpen={showSurvey} onClose={closeSurvey} />}
      <MetaTags />
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kalkulator" element={<Calculator />} />
        <Route path="/koszt-wdrozenia-erp" element={<Cost />} />
        <Route path="/systemy-erp" element={<Systems />} />
        <Route path="/systemy-erp/:systemName" element={<SystemDetail />} />
        <Route path="/porownaj-systemy-erp" element={<Compare />} />
        <Route path="/partnerzy" element={<PartnersPage />} />
        <Route path="/partnerzy/:slug" element={<PartnerDetailPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rejestracja" element={<Register />} />
        <Route path="/rejestracja/sukces" element={<RegistrationSuccess />} />
        <Route path="/rejestracja/oczekujace" element={<PendingAccount />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route 
          path="/admin/home" 
          element={
            <ProtectedRoute requireAdmin allowEditor>
              <AdminHome />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
        <Route 
          path="/admin/systemy" 
          element={
            <ProtectedRoute requireAdmin allowEditor>
              <AdminSystems />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ankiety" 
          element={
            <ProtectedRoute requireAdmin allowEditor>
              <AdminSurveyForms />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ankiety/przypisania" 
          element={
            <ProtectedRoute requireAdmin allowEditor>
              <AdminSurveyAssignments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ankiety/odpowiedzi" 
          element={
            <ProtectedRoute requireAdmin allowEditor>
              <AdminSurveyResponses />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ankiety/:formId/edycja" 
          element={
            <ProtectedRoute requireAdmin allowEditor>
              <SurveyFormEditor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/ankiety/:formId/przypisania" 
          element={
            <ProtectedRoute requireAdmin allowEditor>
              <AdminSurveyAssignments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/systems/new" 
          element={
            <ProtectedRoute requireSystemView>
              <SystemForm mode="create" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/systems/:systemId/edit" 
          element={
            <ProtectedRoute requireSystemView>
              <SystemForm mode="edit" />
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
            <ProtectedRoute requireUserView allowEditor>
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
          path="/admin/firmy-it" 
          element={
            <ProtectedRoute requireAdmin>
              <AdminCompanies />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/companies" 
          element={
            <Navigate to="/admin/firmy-it" replace />
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
        <Route 
          path="/editor" 
          element={
            <ProtectedRoute allowEditor>
              <EditorSystems />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor/systems" 
          element={
            <ProtectedRoute allowEditor>
              <EditorSystems />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor/users"
          element={
            <ProtectedRoute requireUserView allowEditor>
              <EditorUsers />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/editor/firmy-it" 
          element={
            <ProtectedRoute requireCompanyView allowEditor>
              <AdminCompanies />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor/companies" 
          element={
            <Navigate to="/editor/firmy-it" replace />
          }
        />
        <Route path="/slownik-erp" element={<SlownikErp />} />
        <Route path="/slownik-erp/:slug" element={<SlownikErpTerm />} />
        <Route path="/firmy-it" element={<Companies />} />
        <Route 
          path="/firmy-it/:slug" 
          element={<CompanyDetail />}
        />
        <Route 
          path="/companies" 
          element={<Navigate to="/firmy-it" replace />} 
        />
        <Route 
          path="/companies/:slug" 
          element={<Navigate to="/firmy-it/:slug" replace />} 
        />
      </Routes>
      <Footer />
    </>
  );
};

export const App: React.FC = () => {
  useScrollToTop();

  useEffect(() => {
    emailjs.init({
      publicKey: emailConfig.publicKey,
    });
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <OnboardingProvider>
          <UsersProvider>
            <ComparisonProvider>
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <AppContent />
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
            </ComparisonProvider>
          </UsersProvider>
        </OnboardingProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;