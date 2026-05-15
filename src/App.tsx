import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SkillSelection from "./pages/SkillSelection";
import Interview from "./pages/Interview";
import AdminDashboard from "./pages/AdminDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import UpdateProfile from "./pages/UpdateProfile";
import AdminLogin from "./pages/AdminLogin";

function AdminProtectedRoute({
  children,
}: {
  children: React.ReactElement;
}) {
  const isAdminAuthenticated =
    localStorage.getItem("adminLoggedIn") === "true";

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();

  const hideNavbarRoutes = ["/interview"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/update-profile"
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/skill-selection"
          element={
            <ProtectedRoute>
              <SkillSelection />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App(): React.ReactElement {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;