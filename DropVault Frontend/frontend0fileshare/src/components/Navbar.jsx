import React, {useState} from 'react';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Menu, X, Share2, Wallet } from 'lucide-react';
import SidemenuBar from './SidemenuBar';
import CreditsDisplay from './CreditsDisplay';

const Navbar = ({activeMenu}) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);

    return (
        <div className="flex items-center justify-between gap-5 bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-4 sm:px-7 sticky top-0 z-30">
            {/* LEFT SIDE- MENU BUTTON AND TITLE */}
            <div className="flex items-center gap-5">
                <button onClick={() => setOpenSideMenu(!openSideMenu)} className='block lg:hidden text-black hover:bg-gray-100 p-2 rounded  transition-colors duration-200'>
                    {openSideMenu ? (
                        <X className="text-2xl"/>
                    ):(
                        <Menu className="text-2xl"/>
                    )}
                </button>
                <div className='flex items-center gap-2'>
                    <Share2 className="text-blue-600"/>
                    <span className="text-lg font-medium text-black truncate">
                        DropVault
                    </span>
                </div>
            </div>

            {/* RIGHT SIDE - CREDITS AND USER BUTTON */}
            <SignedIn>
            <div className="flex items-center gap-4">
                <Link to="/subscriptions">
                    <CreditsDisplay credits={5} />
                </Link>
                <div className="relative">
                    <UserButton />
                </div>
            </div>
            </SignedIn>

            {/* MOBILE SIDE MENU */}
            {openSideMenu && (
                <div className='fixed top-[73px] left-0 right-0 bg-white border-gray-200 lg:hidden z-20'>
                    <SidemenuBar activeMenu={activeMenu} />
                </div>
            )}
        </div>
    );
};

export default Navbar;