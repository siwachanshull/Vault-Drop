import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import DashboardLayout from "@/Layout/DashboardLayout";
import apiEndpoints from "@/services/apiEndpoints";

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

const SharedFileView = () => {
  const { shareId } = useParams();
  const { getToken } = useAuth();
  const [share, setShare] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(apiEndpoints.GET_SHARE(shareId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load shared file details");
        setShare(await res.json());
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [shareId, getToken]);

  const handleOpen = async () => {
    if (!share) return;
    const decryptionKey = prompt("Enter the base64 decryption key (from email):");
    if (!decryptionKey) return;
    try {
      setStatus("Preparing download…");
      const token = await getToken();
      // Reuse the same backend download info by file id
      const infoRes = await fetch(`${apiEndpoints.DOWNLOAD_FILE}/${share.fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!infoRes.ok) throw new Error("Failed to get download info");
      const info = await infoRes.json();

      if (!info.encryptionIv) {
        alert("Missing encryption metadata.");
        return;
      }

      setStatus("Downloading…");
      const fetchRes = await fetch(info.presignedUrl);
      if (!fetchRes.ok) throw new Error("Failed to fetch encrypted file from storage.");
      const encryptedBuffer = await fetchRes.arrayBuffer();

      setStatus("Decrypting…");
      const decrypted = await decryptFileBuffer(encryptedBuffer, info.encryptionIv, decryptionKey);
      triggerDownload(decrypted, share.fileName, info.contentType);
      setStatus("");
    } catch (e) {
      setError(e.message);
      setStatus("");
    }
  };

  return (
    <DashboardLayout activeMenu="Received">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Open Shared File</h1>
        {error && <p className="text-red-500">{error}</p>}
        {!share ? (
          <p className="text-gray-500 dark:text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">File:</span> {share.fileName}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium">From:</span> {share.senderEmail || "-"}
            </p>
            <button
              onClick={handleOpen}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Enter key and open
            </button>
            {status && <p className="text-sm text-blue-500">{status}</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SharedFileView;

