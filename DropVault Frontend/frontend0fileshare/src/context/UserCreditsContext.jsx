import { createContext, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import apiEndpoints from "@/services/apiEndpoints";

export const UserCreditsContext = createContext({
  credits: 0,
  setCredits: () => {},
  fetchCredits: () => {},
});

export const UserCreditsProvider = ({ children }) => {
  const [credits, setCredits] = useState(0);
  const { getToken } = useAuth();

  const fetchCredits = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch(apiEndpoints.GET_CREDITS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch credits:", err);
    }
  }, [getToken]);

  return (
    <UserCreditsContext.Provider value={{ credits, setCredits, fetchCredits }}>
      {children}
    </UserCreditsContext.Provider>
  );
};
