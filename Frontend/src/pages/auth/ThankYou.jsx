import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHome, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

export default function ThankYou() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                    <div className="mb-8">
                        <FontAwesomeIcon 
                            icon={faCheckCircle} 
                            className="w-16 h-16 text-green-500 mx-auto mb-4" 
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Thank you for signing up!
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Your account has been successfully created and verified. 
                            You can now access all features of our platform.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                            <FontAwesomeIcon icon={faHome} />
                            <span>Go to Homepage</span>
                        </button>
                        
                        <button
                            onClick={() => navigate('/auth/login')}
                            className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                        >
                            <FontAwesomeIcon icon={faSignInAlt} />
                            <span>Sign In</span>
                        </button>
                    </div>

                    <div className="mt-8 text-sm text-gray-500">
                        <p>
                            Welcome to Financial Support! We're excited to have you on board.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 