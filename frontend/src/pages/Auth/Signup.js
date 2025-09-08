import React, { useState, useContext } from "react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Signup = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    // basic client-side check (keeps it simple as requested)
    if (!name.trim() || !email.trim() || !password) {
      setErr("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/signup", { name: name.trim(), email: email.trim(), password });
      login(res.data);
      // redirect to originally requested page (if any) or dashboard
      const dest = location.state?.from?.pathname || "/dashboard";
      navigate(dest, { replace: true });
    } catch (error) {
      console.error("Signup error:", error);

      // Best effort to show helpful message
      const serverMsg =
        error.response?.data?.message ||
        (error.response?.data ? JSON.stringify(error.response.data) : null);

      // If axios reports network/CORS error, give a friendly hint
      const finalMsg =
        serverMsg || (error.code === "ERR_NETWORK" ? "Network error or CORS blocked. Check server and CORS." : error.message);

      setErr(finalMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign up</h2>

        {err && <div role="alert" className="text-red-600 mb-4">{err}</div>}

        <label className="block mb-3">
          <div className="text-sm text-slate-600">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Your full name"
            aria-label="Name"
            required
          />
        </label>

        <label className="block mb-3">
          <div className="text-sm text-slate-600">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="you@example.com"
            aria-label="Email"
            required
          />
        </label>

        <label className="block mb-3">
          <div className="text-sm text-slate-600">Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Choose a secure password"
            aria-label="Password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <div className="mt-4 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
