import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import DashboardLayout from "@/Layout/DashboardLayout";
import apiEndpoints from "@/services/apiEndpoints";
import { getFileKey, deleteFileKey, exportKeyBundle, importKeyBundle } from "@/services/keyStore";



const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function importDecryptionKey(rawKeyBase64) {
  return window.crypto.subtle.importKey(
    "raw",
    fromBase64(rawKeyBase64),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
}

async function decryptFileBuffer(encryptedBuffer, ivBase64, rawKeyBase64) {
  const iv  = fromBase64(ivBase64);
  const key = await importDecryptionKey(rawKeyBase64);
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



const MyFiles = () => {
  const { getToken } = useAuth();
  const [files,         setFiles]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [actionStatus,  setActionStatus]  = useState({});
  const importInputRef = useRef(null);

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
    setFileAction(file.id, "Preparing download…");
    try {
      // Fetch a fresh pre-signed URL + encryption metadata 
      const token = await getToken();
      const infoRes = await fetch(
        `${apiEndpoints.DOWNLOAD_FILE}/${file.id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!infoRes.ok)
        throw new Error(`Failed to get download info: ${infoRes.statusText}`);
      const info = await infoRes.json();

      if (!info.encryptionIv) {
        alert("This file is missing encryption metadata and cannot be decrypted.");
        return;
      }

      // Retrieve the AES key from IndexedDB (key never leaves the browser)
      const keyEntry = await getFileKey(file.id);
      if (!keyEntry) {
        alert(
          "Decryption key not found in this browser.\n" +
          "If you uploaded this file from a different browser or device, " +
          "please import your key backup (.json) to decrypt this file."
        );
        return;
      }

      setFileAction(file.id, "Downloading…");
      const fetchRes = await fetch(info.presignedUrl);
      if (!fetchRes.ok)
        throw new Error("Failed to fetch encrypted file from storage.");
      const encryptedBuffer = await fetchRes.arrayBuffer();

      setFileAction(file.id, "Decrypting…");
      const decryptedBuffer = await decryptFileBuffer(
        encryptedBuffer,
        info.encryptionIv,
        keyEntry.key
      );
      triggerDownload(decryptedBuffer, info.name, info.type);
    } catch (err) {
      alert(`Decryption failed — corrupted file or missing key.\n(${err.message})`);
    } finally {
      setFileAction(file.id, null);
    }
  };

  const handleShare = async (file) => {
    try {
      const recipientEmail = prompt("Enter recipient Gmail:");
      if (!recipientEmail) return;
      const decryptionKey = prompt("Enter the base64 decryption key to send via email:");
      const token = await getToken();
      setFileAction(file.id, "Sharing…");
      const res = await fetch(apiEndpoints.SHARE_FILE(file.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientEmail,
          decryptionKey,
          frontendBaseUrl: window.location.origin,
        }),
      });
      if (!res.ok) throw new Error("Failed to share file");
      const data = await res.json();
      alert(`Shared! Link: ${data.shareUrl}\nWe attempted to email the recipient.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setFileAction(file.id, "");
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
      // Also remove the key from IndexedDB so it doesn't linger
      await deleteFileKey(fileId);
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

  const handleImportKeys = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text  = await file.text();
      const count = await importKeyBundle(text);
      alert(`Imported ${count} key${count !== 1 ? "s" : ""} successfully.`);
    } catch {
      alert("Failed to import key backup. Make sure the file is a valid dropvault-keys.json.");
    } finally {
      e.target.value = "";
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
        <div className="p-6 text-gray-500 dark:text-gray-400">Loading files…</div>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Files</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
            {/* Key management — keys live only in this browser */}
            <button
              onClick={exportKeyBundle}
              className="text-xs text-blue-500 hover:underline"
              title="Download all encryption keys as a JSON backup"
            >
              Export keys
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="text-xs text-blue-500 hover:underline"
              title="Import a previously exported dropvault-keys.json"
            >
              Import keys
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportKeys}
            />
          </div>
        </div>

        {files.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No files uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Size</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Uploaded</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Visibility</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Encryption</th>
                  <th className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td
                      className="px-3 py-2 max-w-xs truncate font-medium text-gray-900 dark:text-gray-100"
                      title={file.name}
                    >
                      {file.name}
                    </td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                      {formatDate(file.uploadAt)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          file.isPublic
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {file.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {file.encryptionIv ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                          AES-256-GCM
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600 text-xs">None</span>
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
                            onClick={() => handleShare(file)}
                            className="text-green-600 hover:underline text-xs"
                          >
                            Share
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
