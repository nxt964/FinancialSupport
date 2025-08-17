import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faUserCog, faChevronDown, faMoon, faCoins } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import headerRoutes from '../utils/navigationUtils';
import { useAppData } from '../contexts/AppDataContext';
import { faSun } from '@fortawesome/free-regular-svg-icons';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { theme, setTheme } = useAppData(); 

    const toggleTheme = () => {
        setTheme(prev => (prev === 'theme-light' ? 'theme-dark' : 'theme-light'));
    };

    useEffect(() => {
        document.documentElement.className = theme;
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (route) => {
        navigate(route)
    }

    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleDetailClick = () => {
        setShowDropdown(false);
        navigate('/profile');
    };

    const handleLogoutClick = () => {
        setShowDropdown(false);
        logout();
        navigate('/');
    };

    const truncateUsername = (username) => {
        return username.length > 12 ? username.substring(0, 12) + '...' : username;
    };

    return (
        <div className="px-4 py-2.5 flex justify-between items-center shadow-sm h-fit">
            {/* Navigation */}
            <div className='flex items-center gap-10'>
                <button
                    onClick={() => handleNavigate('/')}
                    className="flex items-center space-x-2 bg-transparent! font-bold! text-2xl! text-[var(--color-PrimaryColor)]"
                >
                    <FontAwesomeIcon icon={faCoins}/>
                    <span>FINANCIAL SUPPORT</span>
                </button>

                <div className='flex gap-5 font-semibold text-lg'>
                    {headerRoutes.map((route, index) => {
                        return (
                            <Link key={index} to={route.path} className='hover:text-[var(--color-PrimaryColor)] transition-all duration-300'>{route.tag}</Link>
                        )
                    })}
                </div>
            </div>
            
            {/* Authentication */}
            <div className="flex gap-3" ref={dropdownRef}>
                {isAuthenticated() ? (
                    <div className="relative flex items-center">
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center space-x-2 rounded-lg px-2 py-1.5 shadow-sm"
                        >
                            {user.profileImage ? (
                                <img 
                                    src={user.profileImage} 
                                    alt="Profile" 
                                    className="w-5 h-5 rounded-full"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                            )}
                            <span className="text-xs font-medium">
                                {truncateUsername(user.userName)}
                            </span>
                            <FontAwesomeIcon 
                                icon={faChevronDown} 
                                className={`w-2.5 h-2.5 text-[var(--color-SecondaryText)] transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                            />
                        </button>
                        
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-auto rounded-lg shadow-lg border border-[var(--color-Line)] z-50 bg-[var(--color-Input)]">
                                <button
                                    onClick={handleDetailClick}
                                    className="flex items-center space-x-2 bg-transparent! hover:bg-[var(--color-InputLine)]! w-full px-2.5 py-1.5 text-xs text-[var(--color-SecondaryText)]"
                                >
                                    <FontAwesomeIcon icon={faUserCog} className="w-3.5 h-3.5" />
                                    <span>Detail</span>
                                </button>
                                <button
                                    onClick={handleLogoutClick}
                                    className="flex items-center space-x-2 bg-transparent! hover:bg-[var(--color-InputLine)]! w-full px-2.5 py-1.5 text-xs text-[var(--color-TextLink)]"
                                >
                                    <FontAwesomeIcon icon={faSignOutAlt} className="w-3.5 h-3.5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex gap-2'>
                        <button
                            onClick={() => handleNavigate('/auth/signup')}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--color-Line)]! hover:scale-105"
                        >
                            Sign Up
                        </button>
                        
                        <button
                            onClick={() => handleNavigate('/auth/login')}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium hover:scale-105"
                        >
                            Log In
                        </button>
                    </div>
                )}
                
                {/* Theme toggle button */}
                <button
                    onClick={toggleTheme}
                    className="flex items-center bg-[var(--color-Line)]! rounded-lg p-2! shadow-sm ml-2 hover:opacity-80"
                    title="Toggle Theme"
                >
                    <FontAwesomeIcon
                        icon={theme === 'theme-light' ? faMoon : faSun}
                        className="w-3.5 h-3.5"
                    />
                </button>
            </div>
        </div>
    );
}