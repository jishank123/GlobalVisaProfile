import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RoleBasedRoute from './components/RoleBasedRoute';
import DashboardRedirect from './components/DashboardRedirect';
import { Layout } from './components/Layout';
import DisclaimerPopup from './components/DisclaimerPopup';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ManagerLoginPage from './pages/auth/ManagerLoginPage';
import ProfileAssessmentPage from './pages/public/ProfileAssessmentPage';
import ScheduleAppointmentPage from './pages/public/ScheduleAppointmentPage';
import ServicesPage from './pages/public/ServicesPage';
import EB1APage from './pages/public/EB1APage';
import EB2NIWPage from './pages/public/EB2NIWPage';
import O1VisaPage from './pages/public/O1VisaPage';
import ProfileBuildingPage from './pages/public/ProfileBuildingPage';
import AttorneyReferralsPage from './pages/public/AttorneyReferralsPage';
import FAQPage from './pages/public/FAQPage';
import PricingPage from './pages/public/PricingPage';
import ContactPage from './pages/public/ContactPage';
import FormSuccessPage from './pages/public/FormSuccessPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsConditionsPage from './pages/public/TermsConditionsPage';
import AboutPage from './pages/public/AboutPage';
import CareerCoachingPage from './pages/public/CareerCoachingPage';
import GCEB1Page from './pages/public/GCEB1Page';
import PersonalizedPage from './pages/public/PersonalizedPage';


// Dashboard Pages
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import LeadManagerDashboard from './pages/dashboard/lead/LeadManagerDashboard';
import CRMManagerDashboard from './pages/dashboard/crm/CRMManagerDashboard';
import ProjectManagerDashboard from './pages/dashboard/project/ProjectManagerDashboard';
import EmployeeDashboard from './pages/dashboard/employee/EmployeeDashboard';
import ClientProfileDashboard from './pages/dashboard/client/ClientProfileDashboard';

function App() {
  // Get basename from environment variable or default to "/CRM"
  const basename = process.env.REACT_APP_BASE_PATH || '/CRM';

  return (
    <AuthProvider>
      <Router basename={basename}>
        <div className="App">
          <DisclaimerPopup />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/login" element={<Layout showFooter={false} showChat={false}><LoginPage /></Layout>} />
            <Route path="/manager" element={<Layout showFooter={false} showChat={false}><ManagerLoginPage /></Layout>} />
            <Route path="/register" element={<Layout showFooter={false} showChat={false}><RegisterPage /></Layout>} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/verify-email" element={<Layout showFooter={false} showChat={false}><VerifyEmailPage /></Layout>} />
            <Route path="/setup-password" element={<Navigate to="/verify-email" replace />} />
            <Route path="/forgot-password" element={<Layout showFooter={false} showChat={false}><ForgotPasswordPage /></Layout>} />
            <Route path="/reset-password" element={<Layout showFooter={false} showChat={false}><ResetPasswordPage /></Layout>} />
            <Route path="/profile-assessment" element={<Layout><ProfileAssessmentPage /></Layout>} />
            <Route path="/assessment" element={<Navigate to="/profile-assessment" replace />} />
            <Route path="/schedule-appointment" element={<Layout><ScheduleAppointmentPage /></Layout>} />
            <Route path="/schedule" element={<Navigate to="/schedule-appointment" replace />} />
            <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
            <Route path="/eb1a-eligibility" element={<Layout><EB1APage /></Layout>} />
            <Route path="/eb1a" element={<Navigate to="/eb1a-eligibility" replace />} />
            <Route path="/eb2-niw" element={<Layout><EB2NIWPage /></Layout>} />
            <Route path="/o1-visa" element={<Layout><O1VisaPage /></Layout>} />
            <Route path="/career-coaching" element={<Layout><CareerCoachingPage /></Layout>} />
            <Route path="/profile-building" element={<Layout><ProfileBuildingPage /></Layout>} />
            <Route path="/attorney-referrals" element={<Layout><AttorneyReferralsPage /></Layout>} />
            <Route path="/attorneys" element={<Navigate to="/attorney-referrals" replace />} />
            <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
            <Route path="/pricing" element={<Layout><PricingPage /></Layout>} />
            <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
            <Route path="/about" element={<Layout><AboutPage /></Layout>} />
            <Route path="/privacy-policy" element={<Layout><PrivacyPolicyPage /></Layout>} />
            <Route path="/terms-conditions" element={<Layout><TermsConditionsPage /></Layout>} />
            <Route path="/form-success" element={<Layout showFooter={false}><FormSuccessPage /></Layout>} />

            <Route path="/gceb1" element={<Layout><GCEB1Page /></Layout>} />
            <Route path="/personalized" element={<Layout><PersonalizedPage /></Layout>} />

            {/* Protected Dashboard Routes - Role-based routing */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            <Route 
              path="/dashboard/admin" 
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/lead-manager" 
              element={
                <RoleBasedRoute allowedRoles={['lead_manager']}>
                  <LeadManagerDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/crm-manager" 
              element={
                <RoleBasedRoute allowedRoles={['crm_manager']}>
                  <CRMManagerDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/project-manager" 
              element={
                <RoleBasedRoute allowedRoles={['project_manager']}>
                  <ProjectManagerDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/employee" 
              element={
                <RoleBasedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </RoleBasedRoute>
              } 
            />
            
            <Route 
              path="/dashboard/client" 
              element={
                <RoleBasedRoute allowedRoles={['client']}>
                  <ClientProfileDashboard />
                </RoleBasedRoute>
              } 
            />

            {/* Legacy route redirects for backward compatibility */}
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/lead-manager" element={<Navigate to="/dashboard/lead-manager" replace />} />
            <Route path="/crm-manager" element={<Navigate to="/dashboard/crm-manager" replace />} />
            <Route path="/project-manager" element={<Navigate to="/dashboard/project-manager" replace />} />
            <Route path="/employee" element={<Navigate to="/dashboard/employee" replace />} />
            <Route path="/client-profile" element={<Navigate to="/dashboard/client" replace />} />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;