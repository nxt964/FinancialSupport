import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faUserCog, faChevronDown, faHome } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleHomeClick = () => {
        navigate('/');
    };

    const handleLoginClick = () => {
        navigate('/auth/login');
    };

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
        <div className="bg-amber-300 px-3 py-1.5 flex justify-between items-center shadow-sm">
            <button
                onClick={handleHomeClick}
                className="flex items-center space-x-2 bg-white rounded-lg px-2.5 py-1 hover:bg-gray-100 transition-colors shadow-sm"
            >
                <FontAwesomeIcon icon={faHome} className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-xs font-semibold text-gray-800">Financial Support</span>
            </button>
            
            <div className="relative" ref={dropdownRef}>
                {isAuthenticated() ? (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleProfileClick}
                            className="flex items-center space-x-2 bg-white rounded-lg px-2.5 py-1 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            {user.profileImage ? (
                                <img 
                                    src={user.profileImage} 
                                    alt="Profile" 
                                    className="w-5 h-5 rounded-full"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-gray-600" />
                            )}
                            <span className="text-xs font-medium text-gray-700">
                                {truncateUsername(user.userName)}
                            </span>
                            <FontAwesomeIcon 
                                icon={faChevronDown} 
                                className={`w-2.5 h-2.5 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                            />
                        </button>
                        
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                    <button
                                        onClick={handleDetailClick}
                                        className="flex items-center space-x-2 w-full px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                                    >
                                        <FontAwesomeIcon icon={faUserCog} className="w-3.5 h-3.5" />
                                        <span>Detail</span>
                                    </button>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="flex items-center space-x-2 w-full px-2.5 py-1.5 text-xs text-red-600 hover:bg-gray-100"
                                    >
                                        <FontAwesomeIcon icon={faSignOutAlt} className="w-3.5 h-3.5" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={handleLoginClick}
                        className="bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                    >
                        Login
                    </button>
                )}
            </div>
        </div>
    );
}