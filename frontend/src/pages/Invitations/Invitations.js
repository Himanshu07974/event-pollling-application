// frontend/src/pages/InvitedEvents.js
import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

export default function InvitedEvents() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await API.get('/invitations');
        console.log('Invitations API response:', res.data); // <-- important debug log
        setInvitations(res.data.invitations || []);
      } catch (e) {
        console.error('Failed to fetch invitations', e);
        setErr(e.response?.data?.message || 'Failed to load invitations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading invitations…</div>;
  if (err) return <div className="text-red-600">{err}</div>;
  if (!invitations || invitations.length === 0) return <div>No invitations</div>;

  return (
    <div className="space-y-4 p-6">
      {invitations.map(inv => {
        const ev = inv.event || {};
        const from = inv.from || {};
        return (
          <div key={inv._id} className="p-4 border rounded bg-white">
            <h3 className="text-lg font-semibold">{ev.title || 'Untitled event'}</h3>
            <p className="text-sm text-gray-600">{ev.description || 'No description'}</p>

            <div className="mt-2 text-xs text-gray-500">
              From: {from.name ? `${from.name} (${from.email})` : (inv.from || 'Unknown')}
            </div>

            <div className="mt-2 text-sm">
              Status: <strong>{inv.status || 'pending'}</strong>
            </div>

            <div className="mt-3">
              <button
                onClick={() => window.location.assign(`/events/${ev._id || inv.event}`)}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                View
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
