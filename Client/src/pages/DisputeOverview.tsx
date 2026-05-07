/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import Sidebar from "../components/Sidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";
import type { Dispute } from "../types/types";

const statusLabels: Record<string, string> = {
  pending: "AI Assessment",
  invited: "Invited Party",
  in_mediation: "In Mediation",
  resolved: "Resolved",
};

const statusOptions = [
  { value: "pending", label: "AI Assessment" },
  { value: "invited", label: "Invited Party" },
  { value: "in_mediation", label: "In Mediation" },
  { value: "resolved", label: "Resolved" },
];

interface EditFormData {
  category: string;
  opponent_name: string;
  opponent_email: string;
  opponent_phone: string;
  opponent_organization: string;
  status: Dispute["status"];
}

export default function DisputeOverview() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    category: "",
    opponent_name: "",
    opponent_email: "",
    opponent_phone: "",
    opponent_organization: "",
    status: "pending",
  });

  const fetchDisputes = useCallback(async () => {
    try {
      const data = await api.dashboard.getDisputes();
      if (data && Array.isArray(data.disputes)) {
        setDisputes(data.disputes);
        setError(null);
      } else {
        console.error("Invalid response", data);
        setError("Invalid response from server");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load disputes");
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleEdit = (dispute: Dispute) => {
    setEditingId(dispute.id);
    setEditForm({
      category: dispute.category,
      opponent_name: dispute.opponentName,
      opponent_email: dispute.opponentEmail,
      opponent_phone: dispute.opponentPhone,
      opponent_organization: dispute.opponentOrganization || "",
      status: dispute.status,
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      const updateData: Partial<Dispute> = {
        category: editForm.category,
        status: editForm.status,
      };
      await api.dashboard.updateDispute(id, updateData);
      setEditingId(null);
      fetchDisputes();
    } catch (err) {
      console.error(err);
      alert("Failed to update dispute");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.dashboard.deleteDispute(id);
      fetchDisputes();
    } catch (err) {
      console.error(err);
      alert("Failed to delete dispute");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await api.dashboard.updateDispute(id, { status: "resolved" });
      fetchDisputes();
    } catch (err) {
      console.error(err);
      alert("Failed to close dispute");
    }
  };

  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <DashboardTopNav />
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-primary-navy mb-6">
              All Disputes
            </h1>

            {disputes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                No disputes found. Start a new dispute from the dashboard.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {disputes.map((dispute) => (
                      <tr key={dispute.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dispute.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {dispute.title || "(No title)"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {dispute.category || "Not specified"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingId === dispute.id ? (
                            <select
                              value={editForm.status}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  status: e.target.value as Dispute["status"],
                                })
                              }
                              className="border rounded px-2 py-1 text-sm"
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              {statusLabels[dispute.status] || dispute.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {editingId === dispute.id ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Name"
                                value={editForm.opponent_name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    opponent_name: e.target.value,
                                  })
                                }
                                className="border rounded px-2 py-1 w-full"
                              />
                              <input
                                type="email"
                                placeholder="Email"
                                value={editForm.opponent_email}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    opponent_email: e.target.value,
                                  })
                                }
                                className="border rounded px-2 py-1 w-full"
                              />
                              <input
                                type="text"
                                placeholder="Phone"
                                value={editForm.opponent_phone}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    opponent_phone: e.target.value,
                                  })
                                }
                                className="border rounded px-2 py-1 w-full"
                              />
                            </div>
                          ) : (
                            <div>
                              <div>{dispute.opponentName}</div>
                              <div className="text-xs text-gray-400">
                                {dispute.opponentEmail}
                              </div>
                              <div className="text-xs text-gray-400">
                                {dispute.opponentPhone}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => navigate(`/ai/${dispute.id}`, { state: { dispute } })}
                            className="text-blue-600 hover:text-blue-800"
                            >
                            Chat
                            </button>
                          <button
                            onClick={() => navigate(`/dispute/${dispute.id}`)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Progress
                          </button>
                          {editingId === dispute.id ? (
                            <>
                              <button onClick={() => handleUpdate(dispute.id)} className="text-blue-600">
                                Save
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-gray-500">
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(dispute)} className="text-yellow-600">
                                Edit
                              </button>
                              <button onClick={() => handleClose(dispute.id)} className="text-indigo-600">
                                Close
                              </button>
                              <button onClick={() => handleDelete(dispute.id)} className="text-red-600">
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}