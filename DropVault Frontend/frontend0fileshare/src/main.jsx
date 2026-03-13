import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { UserCreditsProvider } from "./context/UserCreditsContext";
import { ThemeProvider } from "./context/ThemeContext";

const clerkpubkey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkpubkey}>
        <UserCreditsProvider>
          <App />
        </UserCreditsProvider>
      </ClerkProvider>
    </ThemeProvider>
  </React.StrictMode>
);
