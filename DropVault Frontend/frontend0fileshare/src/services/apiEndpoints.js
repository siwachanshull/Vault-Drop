const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiEndpoints = {
  // Payment endpoints
  CREATE_ORDER: `${API_BASE_URL}/api/payment/create-order`,
  VERIFY_PAYMENT: `${API_BASE_URL}/api/payment/verify`,
  
  // Credits endpoints
  GET_CREDITS: `${API_BASE_URL}/api/credits`,
  
  // File endpoints
  UPLOAD_FILE: `${API_BASE_URL}/api/files/upload`,
  GET_FILES: `${API_BASE_URL}/api/files`,
  DELETE_FILE: `${API_BASE_URL}/api/files`,
  // Usage: `${DOWNLOAD_FILE}/${fileId}/download`
  DOWNLOAD_FILE: `${API_BASE_URL}/api/files`,
  
  // Profile endpoints
  GET_PROFILE: `${API_BASE_URL}/api/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/profile`,
  
  // Share endpoints
  SHARE_FILE: (fileId) => `${API_BASE_URL}/api/shares/file/${fileId}`,
  LIST_RECEIVED: `${API_BASE_URL}/api/shares/received`,
  GET_SHARE: (shareId) => `${API_BASE_URL}/api/shares/${shareId}`,
};

export default apiEndpoints;