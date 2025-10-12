import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

// 🔹 Auth Pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// 🔹 Common User Pages
import Dashboard from './pages/Dashboard';
import RegistrationDetails from './pages/RegistrationDetails';
import RegistrationMap from './pages/RegistrationMap'; // ✅ NEW IMPORT

import Grievances from './pages/Grievances';
import Appointments from './pages/Appointments';
import MyAppointments from './pages/MyAppointments';
import TokenQueue from './pages/TokenQueue';
import PublicationRegistration from './pages/PublicationRegistration';
import MyPublications from './pages/MyPublications';
import TitleCheck from './pages/TitleCheck';
import AnnualReturns from './pages/AnnualReturns';

// 🔹 Admin Pages
import Admin from './pages/Admin';
import AdminTokenManagement from './pages/AdminTokenManagement';
import AdminPublications from './pages/AdminPublications';
import AdminTitleManagement from './pages/AdminTitleManagement';
import AdminCertificateManagement from './pages/AdminCertificateManagement';
import AdminAnnualReturns from './pages/AdminAnnualReturns';
import AdminGrievances from './pages/AdminGrievances';
import AdminAppointments from './pages/AdminAppointments';

// 🔹 Reports / Analytics Pages
import ApplicationStatus from './pages/index';

// 🔹 Utility Pages
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>

          {/* 🔹 Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* 🔹 Main Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 🔹 General User Routes */}
          <Route path="/registration-details" element={<RegistrationDetails />} />
          <Route path="/registration-map" element={<RegistrationMap />} /> {/* ✅ NEW MAP PAGE */}
          <Route path="/grievances" element={<Grievances />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/token-queue" element={<TokenQueue />} />
          <Route path="/publication-registration" element={<PublicationRegistration />} />
          <Route path="/my-publications" element={<MyPublications />} />
          <Route path="/title-check" element={<TitleCheck />} />
          <Route path="/annual-returns" element={<AnnualReturns />} />

          {/* 🔹 Reports */}
          <Route path="/application-status" element={<ApplicationStatus />} />

          {/* 🔹 Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/tokens" element={<AdminTokenManagement />} />
          <Route path="/admin/publications" element={<AdminPublications />} />
          <Route path="/admin/titles" element={<AdminTitleManagement />} />
          <Route path="/admin/certificates" element={<AdminCertificateManagement />} />
          <Route path="/admin/annual-returns" element={<AdminAnnualReturns />} />
          <Route path="/admin/grievances" element={<AdminGrievances />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />

          {/* 🔹 404 Page */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;