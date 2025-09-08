import React, { useEffect, useState } from "react";
import API from "../../api/axios";

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/invitations");
        setInvitations(res.data.invitations || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const respond = async (id, status) => {
    try {
      await API.post(`/invitations/${id}/respond`, { status });
      setInvitations((s) => s.filter(i => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-semibold mb-6">Invitations</h1>
      <div className="space-y-4">
        {invitations.map(inv => (
          <div key={inv._id} className="bg-white p-4 rounded shadow border flex justify-between items-center">
            <div>
              <div className="font-medium">{inv.event.title}</div>
              <div className="text-sm text-slate-600">{inv.message}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>respond(inv._id,"accepted")} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
              <button onClick={()=>respond(inv._id,"declined")} className="px-3 py-1 bg-red-50 text-red-600 rounded border">Decline</button>
            </div>
          </div>
        ))}
        {invitations.length === 0 && <div className="text-slate-500">No invitations</div>}
      </div>
    </div>
  );
};

export default Invitations;
