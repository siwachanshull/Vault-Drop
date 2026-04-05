import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import DashboardLayout from "@/Layout/DashboardLayout";
import apiEndpoints from "@/services/apiEndpoints";
import { useNavigate } from "react-router-dom";

const formatDate = (iso) => new Date(iso).toLocaleString();

const Received = () => {
  const { getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(apiEndpoints.LIST_RECEIVED, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load received files");
      setItems(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  return (
    <DashboardLayout activeMenu="Received">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Received Files</h1>
        {loading && <p className="text-gray-500 dark:text-gray-400">Loading…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && items.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No files received yet.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">From</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Received</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-3 py-2 max-w-xs truncate font-medium text-gray-900 dark:text-gray-100" title={it.fileName}>
                      {it.fileName}
                    </td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{it.senderEmail || "-"}</td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{formatDate(it.createdAt)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => navigate(`/shared/${it.id}`)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Received;

