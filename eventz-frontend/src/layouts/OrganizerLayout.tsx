import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export default function OrganizerLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Organizer</h2>
        <nav className="space-y-2">
          <Link to="/organizer/dashboard">Dashboard</Link>
          <Link to="/organizer/events">Events</Link>
          <Link to="/organizer/users">Users</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
