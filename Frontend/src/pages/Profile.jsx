import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faIdCard, faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';

export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to view your profile
                    </h2>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Back to Home</span>
                    </button>
                    <button
                        onClick={() => navigate('/edit-profile')}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                        <span>Edit Profile</span>
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        {user.profileImage ? (
                            <img 
                                src={user.profileImage} 
                                alt="Profile" 
                                className="w-16 h-16 rounded-full"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-gray-600" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.userName}</h1>
                            <p className="text-gray-600 capitalize">{user.role}</p>
                        </div>
                    </div>

                    <div className="space-y-4">

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Username</p>
                                <p className="font-medium text-gray-900">{user.userName}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                        <p className="text-sm text-gray-600">
                            This is your account profile page. Here you can view your account details and manage your preferences.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 