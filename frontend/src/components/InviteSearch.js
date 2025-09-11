// frontend/src/components/InviteSearch.js
import React, { useState, useRef } from "react";
import API from "../api/axios";

export default function InviteSearch({ eventId }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [invitingIds, setInvitingIds] = useState(new Set()); // track invites in progress

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // search with debounce + abort
  const handleSearch = (term = query) => {
    const q = term.trim();
    if (!q) return;

    setMessage(null);
    setLoading(true);

    // debounce 300ms
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await API.get(`/users?search=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const list = res.data?.users ?? res.data ?? [];
        setResults(Array.isArray(list) ? list : []);
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          // ignore aborts
          return;
        }
        console.error("Search error:", err);
        const errMsg = err.response?.data?.message || err.message || "Failed to search users";
        setMessage(errMsg);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // invite a single user
  const handleInvite = async (userId, userName) => {
    if (!eventId) return setMessage("No event selected");
    if (!userId) return;

    // prevent double invite clicks
    if (invitingIds.has(userId)) return;
    setInvitingIds((s) => new Set(s).add(userId));
    setMessage(null);

    try {
      const res = await API.post(`/events/${eventId}/invite`, { userIds: [userId] });

      // backend may return invites: [{ userId, status }] or other shape — be defensive
      const invites = res.data?.invites ?? res.data;
      const statusText =
        Array.isArray(invites) && invites[0]?.status
          ? invites[0].status
          : "invited";

      setMessage(`Invitation ${statusText} for ${userName ?? userId}`);
      // remove invited user from results (so they don't appear as inviteable again)
      setResults((r) => r.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Invite error:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to send invite";
      setMessage(errMsg);
    } finally {
      setInvitingIds((s) => {
        const next = new Set(s);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <div className="p-4 border rounded bg-white">
      <h3 className="text-lg font-semibold mb-2">Invite Participants</h3>

      <div className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // run search live as user types (debounced)
            handleSearch(e.target.value);
          }}
          placeholder="Search by name or email"
          className="flex-1 border px-3 py-2 rounded"
          aria-label="Search users"
        />
        <button
          onClick={() => handleSearch(query)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!query.trim() || loading}
        >
          Search
        </button>
      </div>

      {loading && <div className="text-sm mb-2">Searching...</div>}
      {message && <div className="text-sm text-slate-600 mb-2">{message}</div>}

      <ul className="space-y-2">
        {results.length === 0 && !loading && <li className="text-sm text-slate-500">No users found</li>}

        {results.map((u) => (
          <li key={u._id} className="flex justify-between items-center border p-2 rounded">
            <div>
              <div className="font-medium">{u.name}</div>
              <div className="text-sm text-slate-500">{u.email}</div>
            </div>
            <div>
              <button
                onClick={() => handleInvite(u._id, u.name)}
                className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-60"
                disabled={invitingIds.has(u._id)}
                aria-disabled={invitingIds.has(u._id)}
              >
                {invitingIds.has(u._id) ? "Inviting..." : "Invite"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
