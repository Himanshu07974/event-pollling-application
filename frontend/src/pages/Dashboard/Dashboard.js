import React, { useContext, useEffect, useState } from "react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import EventCard from "../../components/EventCard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [mine, setMine] = useState([]);
  const [invited, setInvited] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const myRes = await API.get("/events/mine");
        setMine(myRes.data.events || []);
        const invRes = await API.get("/events/invited");
        setInvited(invRes.data.events || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">My Events</h2>
        <div className="grid gap-4">
          {mine.map((e) => <EventCard key={e._id} event={e} />)}
          {mine.length === 0 && <div className="text-slate-500">No events yet</div>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-4">Invited Events</h2>
        <div className="grid gap-4">
          {invited.map((e) => <EventCard key={e._id} event={e} />)}
          {invited.length === 0 && <div className="text-slate-500">No invited events</div>}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
