// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import Invitations from "./pages/Invitations/Invitations";
import EventDetail from "./pages/Events/EventDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import { useLocation } from "react-router-dom";
import CreateEvent from "./pages/Events/CreateEvent";
const Layout = ({ children }) => {
  const location = useLocation();
  const noSidebarRoutes = ["/login", "/signup"];
  const hideSidebar = noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex">
      {!hideSidebar && <Sidebar />}
      <div className="flex-1">{children}</div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invitations"
          element={
            <ProtectedRoute>
              <Invitations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
