import { useUser } from "@clerk/clerk-react";
import Navbar from "@/components/Navbar";
import SidemenuBar from "@/components/SidemenuBar";

const DashboardLayout = ({children, activeMenu}) => {
    const {user}= useUser();
  return (
    <div className="dashboard-container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
     {/* {navebar component go here} */}
     <Navbar activeMenu={activeMenu} />
     {user && (
        <div className="flex">
            <div className="max-[1080px]:hidden">
                {/* sidebar component go here */}
                <SidemenuBar activeMenu={activeMenu} />
            </div>
            <div className="grow mx-5 text-gray-900 dark:text-gray-100">
                {children}
            </div>
            </div>
     )}
    </div>
  )
}

export default DashboardLayout;