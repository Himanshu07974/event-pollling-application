import React from "react";
import { Link } from "react-router-dom";

const EventCard = ({ event }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{event.description}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/events/${event._id}`} className="px-3 py-1 border rounded-md text-sm">
            View
          </Link>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600">
        <div>Date options: {event.dateOptions?.map(d => new Date(d).toDateString()).join(", ")}</div>
        <div>Participants: {event.participants?.length || 0}</div>
      </div>
    </div>
  );
};

export default EventCard;
