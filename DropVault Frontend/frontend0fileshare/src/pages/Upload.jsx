
import { useState, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import DashboardLayout from "@/Layout/DashboardLayout";
import apiEndpoints from "@/services/apiEndpoints";



const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));

/**
 * Generates a random AES-256-GCM key, encrypts the file, and exports the raw
 * key as base64 so it can be stored on the server alongside the ciphertext.
 * The server never sees plaintext — only the encrypted bytes and the key material.
 */
async function encryptFile(file) {
  const iv  = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit GCM nonce
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,       // extractable so we can export and store it
    ["encrypt"]
  );
  const plaintext  = await file.arrayBuffer();
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );
  const rawKey = await window.crypto.subtle.exportKey("raw", key);
  return {
    encryptedFile: new File([ciphertext], file.name, { type: file.type }),
    iv:           toBase64(iv),
    algorithm:    "AES-256-GCM",
    encryptedKey: toBase64(new Uint8Array(rawKey)),
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const Upload = () => {
  const { getToken } = useAuth();
  const fileInputRef   = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [status,        setStatus]        = useState([]);
  const [uploading,     setUploading]     = useState(false);
  const [dragOver,      setDragOver]      = useState(false);

  const addFiles = (newFiles) => {
    const incoming = Array.from(newFiles).filter(
      (f) => !selectedFiles.some((s) => s.name === f.name && s.size === f.size)
    );
    setSelectedFiles((prev) => [...prev, ...incoming]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setStatus((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setStatus(selectedFiles.map(() => "Encrypting…"));
    try {
      const formData         = new FormData();
      const ivList           = [];
      const algorithmList    = [];
      const encryptedKeyList = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        setStatus((prev) => { const next = [...prev]; next[i] = "Encrypting…"; return next; });
        const { encryptedFile, iv, algorithm, encryptedKey } = await encryptFile(selectedFiles[i]);
        formData.append("files", encryptedFile, encryptedFile.name);
        ivList.push(iv);
        algorithmList.push(algorithm);
        encryptedKeyList.push(encryptedKey);
      }
      ivList.forEach((iv)          => formData.append("iv",           iv));
      algorithmList.forEach((algo) => formData.append("algorithm",    algo));
      encryptedKeyList.forEach((k) => formData.append("encryptedKey", k));

      setStatus(selectedFiles.map(() => "Uploading…"));
      const token = await getToken();
      const res = await fetch(apiEndpoints.UPLOAD_FILE, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      setStatus(selectedFiles.map(() => "Done ✓"));
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      setStatus((prev) => prev.map((s) => (s === "Done ✓" ? s : `Failed ✗ ${err.message}`)));
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024)             return `${bytes} B`;
    if (bytes < 1024 * 1024)      return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <DashboardLayout activeMenu="Upload">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Upload Files</h1>
        <p className="text-sm text-gray-500">
          Files are encrypted in your browser with{" "}
          <strong>AES-256-GCM</strong> using a randomly generated key before
          being sent. The server stores only ciphertext — plaintext content is
          never transmitted or seen by the server.
        </p>

        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <p className="text-gray-500">
            Drag &amp; drop files here, or{" "}
            <span className="text-blue-500 underline">browse</span>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Selected files list */}
        {selectedFiles.length > 0 && (
          <ul className="space-y-2">
            {selectedFiles.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
              >
                <span className="truncate max-w-xs" title={f.name}>{f.name}</span>
                <span className="text-gray-400 mx-3 shrink-0">{formatSize(f.size)}</span>
                {status[i] && (
                  <span
                    className={`mx-2 shrink-0 ${
                      status[i].includes("✓")
                        ? "text-green-600"
                        : status[i].includes("✗")
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  >
                    {status[i]}
                  </span>
                )}
                {!uploading && (
                  <button
                    onClick={() => removeFile(i)}
                    className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                    aria-label="Remove file"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFiles.length}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded transition-colors"
        >
          {uploading
            ? "Encrypting & Uploading…"
            : `Encrypt & Upload ${selectedFiles.length} file${
                selectedFiles.length !== 1 ? "s" : ""
              }`}
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Upload;