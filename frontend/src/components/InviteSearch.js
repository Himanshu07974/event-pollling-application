import React, { useState } from "react";
import API from "../api/axios";

export default function InviteSearch({ eventId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await API.get(`/users?search=${encodeURIComponent(query)}`);
      setResults(res.data.users);
    } catch (err) {
      console.error("Search error:", err);
      setMessage("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId) => {
    try {
      setMessage(null);
      const res = await API.post(`/events/${eventId}/invite`, {
        userIds: [userId],
      });
      setMessage(`Invitation sent to ${res.data.invites[0].userId}`);
    } catch (err) {
      console.error("Invite error:", err);
      setMessage(err.response?.data?.message || "Failed to send invite");
    }
  };

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="text-lg font-semibold mb-2">Invite Participants</h3>
      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {loading && <div>Searching...</div>}
      {message && <div className="text-sm text-slate-600 mb-2">{message}</div>}

      <ul className="space-y-2">
        {results.map((u) => (
          <li
            key={u._id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-slate-500">{u.email}</div>
            </div>
            <button
              onClick={() => handleInvite(u._id)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Invite
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
