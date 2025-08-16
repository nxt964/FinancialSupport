import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHome, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

export default function ThankYou() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="rounded-lg shadow-xl p-8 text-center border border-[var(--color-Line)]">
                    <div className="mb-8">
                        <FontAwesomeIcon 
                            icon={faCheckCircle} 
                            className="text-2xl text-green-500 mx-auto mb-4" 
                        />
                        <h2 className="text-3xl font-bold  mb-4">
                            Thank you for Signing Up!
                        </h2>
                        <p className="text-[var(--color-SecondaryText)] mb-8">
                            Your account has been successfully created and verified. 
                            You can now access all features of our platform.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-[var(--color-TagBg)]! px-6 py-3 rounded-lg hover:scale-103 hover:opacity-80 flex items-center justify-center space-x-2"
                        >
                            <FontAwesomeIcon icon={faHome} />
                            <span>Go to Homepage</span>
                        </button>
                        
                        <button
                            onClick={() => navigate('/auth/login')}
                            className="w-full px-6 py-3 rounded-lg hover:scale-103 hover:opacity-80 flex items-center justify-center space-x-2"
                        >
                            <FontAwesomeIcon icon={faSignInAlt} />
                            <span>Log In</span>
                        </button>
                    </div>

                    <div className="mt-8 text-sm text-[var(--color-SecondaryText)]">
                        <p>
                            Welcome to Financial Support! We're excited to have you on board.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 