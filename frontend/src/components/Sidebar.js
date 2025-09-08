import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    "flex items-center gap-3 px-4 py-3 rounded-lg " +
    (isActive ? "bg-white text-slate-800 shadow-sm" : "text-slate-600 hover:bg-white");

  return (
    <aside className="w-64 bg-slate-50 p-6 border-r min-h-screen flex flex-col justify-between">
      <div>
        <div className="mb-8">
          <div className="text-2xl font-semibold text-slate-800">Event & Polling</div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={linkClass}>
            <span>📅</span>
            <span>My Events</span>
          </NavLink>

          <NavLink to="/invitations" className={linkClass}>
            <span>✉️</span>
            <span>Invited Events</span>
          </NavLink>

          <NavLink to="/create-event" className={linkClass}>
            <span>➕</span>
            <span>Create Event</span>
          </NavLink>
        </nav>
      </div>

      <div className="mt-6 border-t pt-4">
        {user && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-slate-600">Logged in as</span>
            <span className="font-medium text-slate-800">{user.name}</span>
            <button
              onClick={handleLogout}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
