// this file handles clean routing -> stateless auth
// Login → save token → navigate → route re-checks auth
// so everytime route renders, token is checked
// no react state needed, auth derived from token, centralized protection logic

import { Routes, Route, Navigate } from "react-router-dom";
import Landing          from "./pages/Landing";
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import ForgotPassword   from "./pages/ForgotPassword";
import ResetPassword    from "./pages/ResetPassword";
import VerifyEmailSent  from "./pages/VerifyEmailSent";
import VerifyEmail      from "./pages/VerifyEmail";
import Dashboard        from "./pages/Dashboard";
import Transactions     from "./pages/Transactions";
import Budgets          from "./pages/Budgets";
import Calendar         from "./pages/Calendar";
import Charts           from "./pages/Charts";
import Export           from "./pages/Export";
import Profile          from "./pages/Profile";
import Layout           from "./components/Layout";
import ProtectedRoute   from "./routes/ProtectedRoute";
import { useAuth }      from "./context/AuthContext";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/"                  element={<Landing />} />
      <Route path="/login"             element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register"          element={<Register />} />
      <Route path="/forgot-password"   element={<ForgotPassword />} />
      <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
      <Route path="/verify-email"      element={<VerifyEmail />} />
      <Route path="/reset-password"    element={<ResetPassword />} />

      {/* Protected — all share the Layout sidebar */}
      {[
        { path: "/dashboard",    Page: Dashboard    },
        { path: "/transactions", Page: Transactions },
        { path: "/budgets",      Page: Budgets      },
        { path: "/calendar",     Page: Calendar     },
        { path: "/charts",       Page: Charts       },
        { path: "/export",       Page: Export       },
        { path: "/profile",      Page: Profile      },
      ].map(({ path, Page }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <Layout><Page /></Layout>
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
