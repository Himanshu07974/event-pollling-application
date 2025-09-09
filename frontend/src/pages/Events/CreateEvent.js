// frontend/src/pages/Events/CreateEvent.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/**
 * Simple debounce hook
 */
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CreateEvent() {
  const navigate = useNavigate();

  // event fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateOptions, setDateOptions] = useState([]);
  const [participantsSearch, setParticipantsSearch] = useState("");
  const debouncedSearch = useDebounce(participantsSearch, 400);

  // user suggestions and selected participants
  const [suggestions, setSuggestions] = useState([]); // array of user objects
  const [selectedParticipants, setSelectedParticipants] = useState([]); // array of user objects

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // new states for search/invite UI
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [message, setMessage] = useState(null);

  const searchAbortRef = useRef(null);

  // fetch suggestions when debounced search changes
  useEffect(() => {
    const q = debouncedSearch?.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }

    // cancel previous
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setLoadingSearch(true);
    setMessage(null);

    API.get(`/users?search=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((res) => {
        // filter out already selected participants
        const list = res.data.users || res.data || [];
        const filtered = list.filter(
          (u) => !selectedParticipants.some((p) => p._id === u._id)
        );
        setSuggestions(filtered);
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        console.error("User search error:", err);
        setSuggestions([]);
        setMessage("Failed to search users");
      })
      .finally(() => {
        setLoadingSearch(false);
      });

    return () => {
      controller.abort();
      searchAbortRef.current = null;
    };
  }, [debouncedSearch, selectedParticipants]);

  // Date option helpers
  const addDateOption = (date) => {
    if (!date) return;
    setDateOptions((prev) => [...prev, date]);
  };
  const removeDateOption = (idx) => {
    setDateOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Participant helpers
  const inviteUser = (user) => {
    if (!user || !user._id) return;
    // avoid duplicates
    if (selectedParticipants.some((p) => p._id === user._id)) return;
    setSelectedParticipants((prev) => [...prev, user]);
    // remove from suggestions
    setSuggestions((s) => s.filter((x) => x._id !== user._id));
    setParticipantsSearch("");
    setMessage(`Added ${user.name}`);
  };

  const removeParticipant = (userId) => {
    setSelectedParticipants((prev) => prev.filter((p) => p._id !== userId));
  };

  // helper: find single suggestion (or exact match)
  const findSingleSuggestion = () => {
    const q = participantsSearch.trim().toLowerCase();
    if (!q || suggestions.length === 0) return null;
    if (suggestions.length === 1) return suggestions[0];
    const exact = suggestions.find(
      (u) => u.email.toLowerCase() === q || u.name.toLowerCase() === q
    );
    return exact || null;
  };

  // trigger search manually (Search button)
  const handleSearch = async () => {
    const q = participantsSearch.trim();
    if (!q) return;
    setMessage(null);
    setLoadingSearch(true);
    try {
      const res = await API.get(`/users?search=${encodeURIComponent(q)}`);
      const list = res.data.users || res.data || [];
      const filtered = list.filter((u) => !selectedParticipants.some((p) => p._id === u._id));
      setSuggestions(filtered);
    } catch (err) {
      console.error("Search error:", err);
      setMessage("Search failed");
      setSuggestions([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Invite button behavior:
  // - if single suggestion exists -> invite it
  // - else if typed looks like email -> lookup exact email and invite if found
  // - else trigger search
  const handleInviteClick = async () => {
    setMessage(null);

    const single = findSingleSuggestion();
    if (single) {
      inviteUser(single);
      return;
    }

    const typed = participantsSearch.trim();
    if (!typed) return;

    // If typed looks like an email, try lookup exact match
    if (typed.includes("@")) {
      setLoadingSearch(true);
      try {
        const res = await API.get(`/users?search=${encodeURIComponent(typed)}`);
        const list = res.data.users || res.data || [];
        const matched = list.find(u => u.email.toLowerCase() === typed.toLowerCase());
        if (matched) {
          inviteUser(matched);
        } else {
          setMessage("No registered user found with that email.");
        }
      } catch (err) {
        console.error("Lookup by email failed:", err);
        setMessage("Lookup failed. Try searching or invite from suggestions.");
      } finally {
        setLoadingSearch(false);
      }
      return;
    }

    // fallback: run a search
    handleSearch();
  };

  // Create event
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (dateOptions.length === 0) {
      setError("Add at least one date option.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        dateOptions: dateOptions.map((d) => d.toISOString()),
        participants: selectedParticipants.map((p) => p._id),
      };

      const res = await API.post("/events", payload);
      const eventId = res.data?.event?._id || res.data?._id || res.data?.eventId;
      // Redirect to event detail or dashboard
      if (eventId) navigate(`/events/${eventId}`);
      else navigate("/dashboard");
    } catch (err) {
      console.error("Failed to create event:", err);
      setError(
        err.response?.data?.message ||
          (err.response?.data ? JSON.stringify(err.response.data) : "Failed to create event")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create Event</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Team Sync"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full border rounded px-3 py-2"
            placeholder="Brief description"
          />
        </div>

        {/* Date options */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Date options</label>
          <div className="flex gap-3 items-center mt-2">
            <DatePicker
              selected={null}
              onChange={(d) => addDateOption(d)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="yyyy-MM-dd h:mm aa"
              placeholderText="Click to select date & time"
              className="border rounded px-3 py-2"
            />
            <div className="text-sm text-slate-500">Pick one option and it will be added to the list below.</div>
          </div>

          <ul className="mt-3 space-y-2">
            {dateOptions.map((d, i) => (
              <li key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                <div>{d.toLocaleString()}</div>
                <button
                  type="button"
                  onClick={() => removeDateOption(i)}
                  className="text-red-500 px-2 py-1"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Participant search & suggestions */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Participants (search by name or email)</label>

          <div className="mt-2 relative">
            <div className="flex gap-2">
              <input
                value={participantsSearch}
                onChange={(e) => setParticipantsSearch(e.target.value)}
                placeholder="Type name or email to search"
                className="flex-1 border rounded px-3 py-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleInviteClick}
                title="Invite selected or lookup by email"
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Invite
              </button>

              <button
                type="button"
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Search
              </button>
            </div>

            {/* feedback */}
            <div className="mt-2 text-sm text-slate-600">
              {loadingSearch ? "Searching..." : message ? message : null}
            </div>

            {/* suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
                {suggestions.map((u) => (
                  <div key={u._id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50">
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => inviteUser(u)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* selected participants */}
          <div className="mt-3 space-y-2">
            {selectedParticipants.map((p) => (
              <div key={p._id} className="flex items-center justify-between bg-slate-100 p-2 rounded">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeParticipant(p._id)}
                  className="text-red-500 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
          >
            {submitting ? "Creating..." : "Create Event"}
          </button>

          <button
            type="button"
            onClick={() => {
              // quick clear form
              setTitle("");
              setDescription("");
              setDateOptions([]);
              setSelectedParticipants([]);
              setParticipantsSearch("");
              setSuggestions([]);
              setMessage(null);
            }}
            className="px-3 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
