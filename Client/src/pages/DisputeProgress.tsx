import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";

export default function DisputeProgress() {
  const { id } = useParams();
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-xl font-bold text-primary-navy mb-4">Mediation Progress</h1>
            <p className="text-gray-600">Dispute ID: {id}</p>
            <p className="mt-4">Progress timeline and mediation steps will appear here.</p>
            <Link to="/dispute-overview" className="inline-block mt-6 text-primary-navy underline">
              ← Back to all disputes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}