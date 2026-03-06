import DashboardLayout from "@/Layout/DashboardLayout";
import { useAuth } from "@clerk/clerk-react";
import { useContext, useEffect, useRef, useState } from "react";
import { UserCreditsContext } from "@/context/UserCreditsContext";
import { apiEndpoints } from "@/services/apiEndpoints";

const Subscriptions = () => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [razorPayLoaded, setRazorPayLoaded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { getToken } = useAuth();
  const razorpayScriptRef = useRef(null);
  const { credits, setCredits, fetchCredits } = useContext(UserCreditsContext);

  const plans = [
    {
      id: "premium",
      name: "Premium",
      credits: 500,
      price: 50000, // in paise (₹500)
      displayPrice: "₹500",
      features: [
        "Upload upto 500 files",
        "Access to all basic features",
        "Priority customer support",
      ],
      recommended: false,
    },
    {
      id: "ultimate",
      name: "Ultimate Plan",
      credits: 5000,
      price: 250000, // in paise (₹2500)
      displayPrice: "₹2,500",
      features: [
        "Upload upto 5000 files",
        "Access to all premium features",
        "Priority customer support",
        "Advanced analytics",
      ],
      recommended: true,
    },
  ];

  // Load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded");
        setRazorPayLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        setMessage("Failed to load payment gateway. Please try again later.");
        setMessageType("error");
      };
      document.body.appendChild(script);
      razorpayScriptRef.current = script;
    } else {
      setRazorPayLoaded(true);
    }

    return () => {
      if (razorpayScriptRef.current && document.body.contains(razorpayScriptRef.current)) {
        document.body.removeChild(razorpayScriptRef.current);
      }
    };
  }, []);

  // Fetch user credits on mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const token = await getToken();
        const response = await fetch(apiEndpoints.GET_CREDITS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);
        }
      } catch (error) {
        console.error("Error fetching user credits:", error);
      }
    };
    fetchUserCredits();
  }, [getToken, setCredits]);

  // Create Razorpay order
  const createOrder = async (plan) => {
    try {
      const token = await getToken();
      const response = await fetch(apiEndpoints.CREATE_ORDER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: "INR",
          planId: plan.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      return data.orderId;
    } catch (error) {
      throw error;
    }
  };

  // Verify payment with backend
  const verifyPayment = async (paymentData, planId) => {
    try {
      const token = await getToken();
      const response = await fetch(apiEndpoints.VERIFY_PAYMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          planId: planId,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Handle subscription purchase
  const handleSubscribe = async (plan) => {
    if (!razorPayLoaded) {
      setMessage("Payment gateway is still loading. Please wait.");
      setMessageType("error");
      return;
    }

    setProcessingPayment(true);
    setSelectedPlan(plan.id);
    setMessage("");

    try {
      // Step 1: Create order on backend
      const orderId = await createOrder(plan);

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: plan.price,
        currency: "INR",
        name: "DropVault",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend
            const verificationResult = await verifyPayment(response, plan.id);

            if (verificationResult.success) {
              setMessage(`Payment successful! ${plan.credits} credits added to your account.`);
              setMessageType("success");
              // Refresh credits
              if (fetchCredits) {
                fetchCredits();
              } else {
                setCredits((prev) => prev + plan.credits);
              }
            } else {
              setMessage(verificationResult.message || "Payment verification failed.");
              setMessageType("error");
            }
          } catch (error) {
            setMessage("Payment verification failed. Please contact support.");
            setMessageType("error");
          } finally {
            setProcessingPayment(false);
            setSelectedPlan(null);
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            setSelectedPlan(null);
            setMessage("Payment cancelled.");
            setMessageType("error");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        setMessage(`Payment failed: ${response.error.description}`);
        setMessageType("error");
        setProcessingPayment(false);
        setSelectedPlan(null);
      });

      razorpay.open();
    } catch (error) {
      setMessage(error.message || "Failed to initiate payment. Please try again.");
      setMessageType("error");
      setProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  return (
    <DashboardLayout activeMenu="Subscriptions">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Plans
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Choose a plan that works best for you
          </p>
          {credits !== undefined && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Current Credits: <span className="font-semibold text-indigo-600">{credits}</span>
            </p>
          )}
        </div>

        {/* Message display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === "error"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-green-100 text-green-700 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-200 ${
                plan.recommended
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg scale-105"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300"
              }`}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Recommended
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h2>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {plan.displayPrice}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    one-time
                  </span>
                </div>
                <p className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold">
                  {plan.credits} Credits
                </p>
              </div>

              {/* Features list */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Subscribe button */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={processingPayment}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-all duration-200 ${
                  processingPayment && selectedPlan === plan.id
                    ? "bg-gray-400 cursor-not-allowed"
                    : plan.recommended
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                }`}
              >
                {processingPayment && selectedPlan === plan.id ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Get ${plan.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Security note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Secured by Razorpay. Your payment information is safe. 
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;