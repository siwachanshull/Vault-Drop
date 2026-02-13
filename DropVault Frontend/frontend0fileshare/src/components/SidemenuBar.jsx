import React, { use } from 'react';
import { useUser } from '@clerk/clerk-react';
import { User } from 'lucide-react';
import { SIDE_MENU_DATA } from '@/assets/data';
import { useNavigate } from 'react-router-dom';

const SidemenuBar = ({activeMenu}) => {
  const { user } = useUser();
  const navigate = useNavigate();
  return(
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-[61px] z-20 ">
        <div className="flex flex-col items-center justify-center gap-3 mt-3 mt-7">
            {user?.imageUrl ? (
                <img src={user?.imageUrl || ""} alt="Profile image" className="w-20 h-20 bg-slate-400 rounded-full"/>
                ) : (
                    <User className="w-20 h-20 text-xl" />
                )}
                <h5 className="text-gray-950 font-medium leading-6">
                    {user?.fullName || ""}
                </h5>
        </div>
        <div className="mt-10">
            {SIDE_MENU_DATA.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 transition-all duration-200 cursor-pointer ${activeMenu === item.label ? "bg-purple-500 text-white font-medium" : "text-gray-700 shadow-md hover:bg-purple-600"}`}
                        onClick={()=> navigate(item.path)}>
                        <Icon className="text-xl" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    </div>
  )
};

export default SidemenuBar;