/**
 * keyStore.js
 *
 * IndexedDB wrapper for storing AES-256-GCM file keys entirely on the
 * client side.  Keys never leave the browser — the server only ever
 * receives the encrypted file bytes and the IV.
 *
 * Schema: { fileId (PK), name, key (base64 raw AES), iv (base64) }
 */

const DB_NAME    = "dropvault-keys";
const STORE_NAME = "file-keys";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: "fileId" });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/** Persist a key entry after a successful upload. */
export async function storeFileKey(fileId, rawKeyBase64, ivBase64, name) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ fileId, key: rawKeyBase64, iv: ivBase64, name });
    tx.oncomplete = () => resolve();
    tx.onerror    = (e) => reject(e.target.error);
  });
}

/** Retrieve the key entry for a given file, or null if not found. */
export async function getFileKey(fileId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(fileId);
    req.onsuccess = (e) => resolve(e.target.result ?? null);
    req.onerror   = (e) => reject(e.target.error);
  });
}

/** Remove a key after the file has been deleted. */
export async function deleteFileKey(fileId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(fileId);
    tx.oncomplete = () => resolve();
    tx.onerror    = (e) => reject(e.target.error);
  });
}

/** Export all stored key entries as a JSON blob for backup. */
export async function exportKeyBundle() {
  const db = await openDB();
  const entries = await new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
  const json = JSON.stringify({ "dropvault-keys": entries }, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "dropvault-keys.json";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import keys from a previously exported JSON bundle.
 * Returns the number of entries imported.
 */
export async function importKeyBundle(jsonText) {
  const parsed = JSON.parse(jsonText);
  const entries = parsed["dropvault-keys"];
  if (!Array.isArray(entries)) throw new Error("Invalid key bundle format.");
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    entries.forEach((entry) => store.put(entry));
    tx.oncomplete = () => resolve();
    tx.onerror    = (e) => reject(e.target.error);
  });
  return entries.length;
}
