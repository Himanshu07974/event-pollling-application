import InviteSearch from "../../components/InviteSearch";

export default function EventDetail({ eventId }) {
  return (
    <div>
      {/* Event info here */}
      <InviteSearch eventId={eventId} />
    </div>
  );
}
