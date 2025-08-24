import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        Please log in to view your profile
                    </h2>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="px-4 py-2 rounded-lg hover:scale-105 hover:opacity-80"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-4 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 bg-transparent! text-[var(--color-PrimaryColor)] hover:underline"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Back to Home</span>
                    </button>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => navigate('/edit-profile')}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:scale-103"
                        >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Edit Profile</span>
                        </button>
                        <button
                            onClick={() => navigate('/edit-password')}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:scale-103"
                        >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Edit Password</span>
                        </button>
                    </div>
                </div>

                <div className="shadow-lg rounded-lg p-6 border border-[var(--color-Line)]">
                    <div className="flex items-center space-x-4 mb-6">
                        {/* {user.profileImage ? (
                            <img 
                                src={user.profileImage} 
                                alt="Profile" 
                                className="w-16 h-16 rounded-full"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-[var(--color-TagBg)] rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-[var(--color-SecondaryText)]" />
                            </div>
                        )} */}
                        <div>
                            <h1 className="text-2xl font-bold">{user.userName}</h1>
                            <p className="text-[var(--color-SecondaryText)] capitalize">{user.role}</p>
                        </div>
                    </div>

                    <div className="space-y-4">

                        <div className="flex items-center space-x-3 p-3 bg-[var(--color-TagBg)] rounded-lg">
                            <FontAwesomeIcon icon={faUser} className="w-5 h-5" />
                            <div>
                                <p className="text-sm font-semibold">Username</p>
                                <p className="font-medium text-[var(--color-SecondaryText)]">{user.userName}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-[var(--color-TagBg)] rounded-lg">
                            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
                            <div>
                                <p className="text-sm font-semibold">Email</p>
                                <p className="font-medium text-[var(--color-SecondaryText)]">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-gray-300">
                        <h3 className="text-lg font-semibold ">Account Information</h3>
                        <p className="text-sm text-[var(--color-SecondaryText)]">
                            This is your account profile page. Here you can view your account details and manage your preferences.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 