import { useUser } from "@clerk/clerk-react";
import Navbar from "@/components/Navbar";
import SidemenuBar from "@/components/SidemenuBar";

const DashboardLayout = ({children, activeMenu}) => {
    const {user}= useUser();
  return (
    <div className="dashboard-container">
     {/* {navebar component go here} */}
     <Navbar activeMenu={activeMenu} />
     {user && (
        <div className="flex">
            <div className="max-[1080px]:hidden">
                {/* sidebar component go here */}
                <SidemenuBar activeMenu={activeMenu} />
            </div>
            <div className="grow mx-5">
                {children}
            </div>
            </div>
     )}
    </div>
  )
}

export default DashboardLayout;