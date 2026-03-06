import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import DashboardLayout from "@/Layout/DashboardLayout";
import apiEndpoints from "@/services/apiEndpoints";

// ─── Web Crypto helpers ────────────────────────────────────────────────────────

const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function deriveDecryptionKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

async function decryptFileBuffer(encryptedBuffer, ivBase64, saltBase64, passphrase) {
  const iv   = fromBase64(ivBase64);
  const salt = fromBase64(saltBase64);
  const key  = await deriveDecryptionKey(passphrase, salt);
  return window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encryptedBuffer);
}

function triggerDownload(buffer, filename, mimeType) {
  const blob = new Blob([buffer], { type: mimeType || "application/octet-stream" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ─────────────────────────────────────────────────────────────────

const MyFiles = () => {
  const { getToken } = useAuth();
  const [files,         setFiles]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionStatus,  setActionStatus]  = useState({});

  const setFileAction = (id, msg) =>
    setActionStatus((prev) => ({ ...prev, [id]: msg }));

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res   = await fetch(apiEndpoints.GET_FILES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load files: ${res.statusText}`);
      setFiles(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleDownload = async (file) => {
    if (!file.presignedUrl) {
      alert("No download URL available for this file.");
      return;
    }
    if (!file.encryptionIv || !file.encryptionSalt) {
      alert("This file has no encryption metadata and cannot be decrypted.");
      return;
    }
    const passphrase = window.prompt(
      `Enter the encryption passphrase for "${file.name}":`
    );
    if (!passphrase) return;

    setFileAction(file.id, "Downloading…");
    try {
      const fetchRes = await fetch(file.presignedUrl);
      if (!fetchRes.ok)
        throw new Error("Failed to fetch encrypted file from storage.");
      const encryptedBuffer = await fetchRes.arrayBuffer();

      setFileAction(file.id, "Decrypting…");
      const decryptedBuffer = await decryptFileBuffer(
        encryptedBuffer,
        file.encryptionIv,
        file.encryptionSalt,
        passphrase
      );
      triggerDownload(decryptedBuffer, file.name, file.type);
    } catch (err) {
      alert(
        `Decryption failed — wrong passphrase or corrupted file.\n(${err.message})`
      );
    } finally {
      setFileAction(file.id, null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Permanently delete this file? This cannot be undone."))
      return;
    setFileAction(fileId, "Deleting…");
    try {
      const token = await getToken();
      const res   = await fetch(`${apiEndpoints.DELETE_FILE}/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      alert(err.message);
      setFileAction(fileId, null);
    }
  };

  const handleTogglePublic = async (file) => {
    setFileAction(file.id, "Updating…");
    try {
      const token = await getToken();
      const res   = await fetch(
        `${apiEndpoints.GET_FILES}/${file.id}/toggle-public?makePublic=${!file.isPublic}`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Toggle failed: ${res.statusText}`);
      const updated = await res.json();
      setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
    } catch (err) {
      alert(err.message);
    } finally {
      setFileAction(file.id, null);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes)              return "—";
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (raw) =>
    raw ? new Date(raw).toLocaleDateString() : "—";

  if (loading)
    return (
      <DashboardLayout activeMenu="My Files">
        <div className="p-6 text-gray-500">Loading files…</div>
      </DashboardLayout>
    );

  if (error)
    return (
      <DashboardLayout activeMenu="My Files">
        <div className="p-6 text-red-500">Error: {error}</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout activeMenu="My Files">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Files</h1>
          <span className="text-sm text-gray-400">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        </div>

        {files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Size</th>
                  <th className="px-3 py-2 font-medium">Uploaded</th>
                  <th className="px-3 py-2 font-medium">Visibility</th>
                  <th className="px-3 py-2 font-medium">Encryption</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-t hover:bg-gray-50">
                    <td
                      className="px-3 py-2 max-w-xs truncate font-medium"
                      title={file.name}
                    >
                      {file.name}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {formatDate(file.uploadAt)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          file.isPublic
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {file.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {file.encryptionIv ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          AES-256-GCM
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {actionStatus[file.id] ? (
                        <span className="text-blue-500 text-xs">
                          {actionStatus[file.id]}
                        </span>
                      ) : (
                        <div className="flex gap-3">
                          {file.encryptionIv && (
                            <button
                              onClick={() => handleDownload(file)}
                              className="text-blue-600 hover:underline text-xs"
                            >
                              Download
                            </button>
                          )}
                          <button
                            onClick={() => handleTogglePublic(file)}
                            className="text-gray-500 hover:underline text-xs"
                          >
                            {file.isPublic ? "Make Private" : "Make Public"}
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-500 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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

export default MyFiles;
