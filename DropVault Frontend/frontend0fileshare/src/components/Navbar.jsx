import React, {useState} from 'react';
import { SignedIn, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Menu, X, Share2, Sun, Moon } from 'lucide-react';
import SidemenuBar from './SidemenuBar';
import CreditsDisplay from './CreditsDisplay';
import { useTheme } from '@/context/ThemeContext';

const Navbar = ({activeMenu}) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="flex items-center justify-between gap-5 bg-white dark:bg-gray-900 border border-b border-gray-200/50 dark:border-gray-700 backdrop-blur-[2px] py-4 px-4 sm:px-7 sticky top-0 z-30">
            {/* LEFT SIDE- MENU BUTTON AND TITLE */}
            <div className="flex items-center gap-5">
                <button onClick={() => setOpenSideMenu(!openSideMenu)} className='block lg:hidden text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded transition-colors duration-200'>
                    {openSideMenu ? (
                        <X className="text-2xl"/>
                    ):(
                        <Menu className="text-2xl"/>
                    )}
                </button>
                <div className='flex items-center gap-2'>
                    <Share2 className="text-blue-600"/>
                    <span className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        DropVault
                    </span>
                </div>
            </div>

            {/* RIGHT SIDE - CREDITS, THEME TOGGLE AND USER BUTTON */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    aria-label="Toggle dark mode"
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <SignedIn>
                    <Link to="/subscriptions">
                        <CreditsDisplay credits={5} />
                    </Link>
                    <div className="relative">
                        <UserButton />
                    </div>
                </SignedIn>
            </div>

            {/* MOBILE SIDE MENU */}
            {openSideMenu && (
                <div className='fixed top-[73px] left-0 right-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 lg:hidden z-20'>
                    <SidemenuBar activeMenu={activeMenu} />
                </div>
            )}
        </div>
    );
};

export default Navbar;