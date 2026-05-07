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

function AppContent() {
  const location = useLocation();

  const hideNavbarRoutes = ["/interview"];
  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname);

  const isAdminAuthenticated =
    localStorage.getItem("adminLoggedIn") ===
    "true";

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* ADMIN LOGIN */}
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            isAdminAuthenticated ? (
              <AdminDashboard />
            ) : (
              <Navigate
                to="/admin-login"
                replace
              />
            )
          }
        />

        {/* CANDIDATE LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* CANDIDATE DASHBOARD */}
        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        {/* UPDATE PROFILE */}
        <Route
          path="/update-profile"
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />

        {/* SKILL SELECTION */}
        <Route
          path="/skill-selection"
          element={
            <ProtectedRoute>
              <SkillSelection />
            </ProtectedRoute>
          }
        />

        {/* INTERVIEW */}
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
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