import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut
} from "@clerk/clerk-react";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MyFiles from "./pages/MyFiles";
import PublicFiles from "./pages/PublicFiles";
import Transactions from "./pages/Transactions";
import Subscriptions from "./pages/Subscriptions";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn><Dashboard /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />

        <Route
          path="/upload"
          element={
            <>
              <SignedIn><Upload /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />

        <Route
          path="/myfiles"
          element={
            <>
              <SignedIn><MyFiles /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />

        <Route path="/public-files" element={<PublicFiles />} />

        <Route
          path="/transactions"
          element={
            <>
              <SignedIn><Transactions /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />

        <Route
          path="/subscriptions"
          element={
            <>
              <SignedIn><Subscriptions /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />

        <Route path="*" element={<RedirectToSignIn />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
