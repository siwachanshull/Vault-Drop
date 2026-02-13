import Hero from "../Landing/Hero";
import Features from "../Landing/Features";
import Footer from "../Landing/Footer";

import { useClerk, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Landing = () => {
  const { openSignIn, openSignUp } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="landing-page bg-gradient-to-b from-gray-50 to-gray-100">
      <Hero openSignIn={openSignIn} openSignUp={openSignUp} />
      <Features />
      <Footer />
    </div>
  );
};

export default Landing;
