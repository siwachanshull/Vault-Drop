import DashboardLayout from "@/Layout/DashboardLayout";
import { useAuth } from "@clerk/clerk-react";
import { use, useContext } from "react";

const Subscriptions = () => {
  const[processingPayment, setProcessingPayment] = useState(false);
  const[message, setMessage] = useState("");
  const[messageType, setMessageType] = useState("");
  const [razorPayLoaded, setRazorPayLoaded] = useState(false);

  const{getToken}= useAuth();
  const razorpayScriptRef = useRef(null);
  const{credits,setCredits, fetchCredits}= useContext(UserCreditsContext);
  const plans = [
    { id: "premium", name: "Premium",credits:500, price: 500, features:[
      "Upload upto 500 files",
      "Access to all basic features",
      "Priority customer support"
    ],
    recommended: false
   },
    { id: "ultimate", name: "Ultimate Plan",credits:5000, price: 2500,features:[
      "Upload upto 5000 files",
      "Access to all premium features",
      "Priority customer support"
    ],
    recommended: true
     },
  ];

  useEffect(() => {
    if(!window.Razorpay){
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async=true;
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
    }else{
      setRazorPayLoaded(true);
    }
    return () => {
      if(razorpayScriptRef.current){
        document.body.removeChild(razorpayScriptRef.current);
      }
    };
  },[]);
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const token = await getToken();
        const response = await fetch(apiEndpoints.GET_CREDITS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCredits(response.data.credits);
      } catch (error) {
        console.error("Error fetching user credits:", error);
        setMessage("Failed to fetch user credits. Please try again later.");
        setMessageType("error");
  }
};
fetchUserCredits();
  }, [getToken]);
  return (
    <DashboardLayout activeMenu="Subscriptions">
            <div>Subscriptions page content goes here</div>
        </DashboardLayout>
  );
};

export default Subscriptions;