/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";
import { Calendar, Clock, Copy, ExternalLink, Users } from "lucide-react";

const MEET_LINKS = [
  "https://meet.google.com/nij-vrdw-yky",
  "https://meet.google.com/azq-aezm-nnq",
  "https://meet.google.com/zaa-mmbh-jno",
  "https://meet.google.com/aop-uqex-wia",
  "https://meet.google.com/pif-psax-ysy",
];

// Define a local type for the API response (snake_case)
interface ApiDispute {
  id: string;
  description: string;
  category: string;
  opponent_name: string;
  opponent_email: string;
  opponent_phone: string;
  opponent_organization?: string;
  status: string;
  created_at: string;
}

export default function DisputeProgress() {
  const { id } = useParams<{ id: string }>();
  const [dispute, setDispute] = useState<ApiDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDispute = async () => {
      try {
        const data = await api.dashboard.getDispute(id);
        setDispute(data.dispute as ApiDispute);
      } catch (err) {
        console.error(err);
        setError("Failed to load dispute details");
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [id]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MEET_LINKS.length);
    setMeetingLink(MEET_LINKS[randomIndex]);
  }, []);

  useEffect(() => {
    if (!dispute?.created_at) return;
    const deadline = new Date(dispute.created_at).getTime() + 48 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dispute]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-gray-500">Loading dispute details...</div>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="flex min-h-screen bg-gray-100 font-sans">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-red-500">{error || "Dispute not found"}</div>
        </div>
      </div>
    );
  }

  const createdDate = new Date(dispute.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Truncate description for preview? Show full description in the summary card
  const descriptionPreview = dispute.description.length > 200
    ? dispute.description.slice(0, 200) + "..."
    : dispute.description;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Dispute Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-primary-navy mb-4">Dispute Summary</h2>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {dispute.category || "Not specified"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Status: {dispute.status || "Pending"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Description</p>
                  <p className="text-gray-700">{descriptionPreview}</p>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Initiated: {createdDate}</span>
                </div>
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Opponent Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div><span className="font-medium">Name:</span> {dispute.opponent_name || "Not provided"}</div>
                    <div><span className="font-medium">Email:</span> {dispute.opponent_email || "Not provided"}</div>
                    <div><span className="font-medium">Phone:</span> {dispute.opponent_phone || "Not provided"}</div>
                    {dispute.opponent_organization && (
                      <div><span className="font-medium">Organization:</span> {dispute.opponent_organization}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mediation Progress Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-primary-navy" />
                <h2 className="text-2xl font-bold text-primary-navy">Mediation Progress</h2>
              </div>

              <div className="space-y-8">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <p className="text-blue-800 font-medium flex items-start gap-2">
                    <span className="text-blue-500">✓</span>
                    An arbitrator has been reached out to. A virtual meeting will be held in 48 hours from the dispute initiation.
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-gray-600 mb-3">
                    <Clock size={18} />
                    <span className="text-sm font-medium">Time until virtual meeting</span>
                  </div>
                  {timeLeft && (timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) ? (
                    <div className="flex justify-center gap-4">
                      <div className="bg-gray-100 rounded-lg p-3 min-w-20">
                        <div className="text-3xl font-bold text-primary-navy">{timeLeft.hours}</div>
                        <div className="text-xs text-gray-500">Hours</div>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 min-w-20">
                        <div className="text-3xl font-bold text-primary-navy">{timeLeft.minutes}</div>
                        <div className="text-xs text-gray-500">Minutes</div>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 min-w-20">
                        <div className="text-3xl font-bold text-primary-navy">{timeLeft.seconds}</div>
                        <div className="text-xs text-gray-500">Seconds</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl font-semibold text-green-600">Meeting time has arrived!</div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your dedicated meeting link</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      readOnly
                      value={meetingLink}
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 text-sm focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Copy size={16} />
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-navy hover:bg-blue-900 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink size={16} />
                        Join Meeting
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This link is randomly assigned. Please join at the scheduled time.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium mb-1">What to expect</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Ensure you have a stable internet connection and a quiet environment.</li>
                    <li>Have all relevant documents ready (uploaded evidence will be shared with the arbitrator).</li>
                    <li>Arrive 5 minutes early to test your camera and microphone.</li>
                    <li>If you cannot attend, please contact support at least 24 hours in advance.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}