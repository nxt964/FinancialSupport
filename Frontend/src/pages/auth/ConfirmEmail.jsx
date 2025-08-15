import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export default function ConfirmEmail() {
    const [code, setCode] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const { confirmEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const handleInputChange = (e) => {
        const { value } = e.target;
        setCode(value);
        // Clear field error when user starts typing
        if (fieldErrors.code) {
            setFieldErrors(prev => ({
                ...prev,
                code: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!code.trim()) {
            toast.error('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        setFieldErrors({});

        try {
            const result = await confirmEmail(email, code);
            
            if (result.success) {
                toast.success('Email confirmed successfully!');
                navigate('/auth/thank-you');
            } else {
                if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                    setFieldErrors(result.fieldErrors);
                } else {
                    toast.error(result.error || 'Email confirmation failed');
                }
            }
        } catch (error) {
            toast.error('An error occurred during confirmation');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="rounded-lg shadow-xl p-8 text-center border border-[var(--color-Line)]">
                        <h2 className="text-3xl font-bold mb-2">
                            Invalid Access
                        </h2>
                        <p className="text-[var(--color-SecondaryText)] mb-4">
                            Please sign up first to access email confirmation.
                        </p>
                        <button
                            onClick={() => navigate('/auth/signup')}
                            className="px-4 py-2 rounded-lg hover:scale-105 hover:opacity-80"
                        >
                            Go to Sign Up
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="rounded-lg shadow-xl p-8 border border-[var(--color-Line)]">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/auth/signup')}
                            className="flex items-center space-x-2 mb-4 bg-transparent! text-[var(--color-PrimaryColor)] hover:underline"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Back to Sign Up</span>
                        </button>
                        <h2 className="text-3xl font-bold text-center">
                            Confirm Email
                        </h2>
                        <p className="text-sm text-[var(--color-TertiaryText)] text-center mt-2">
                            We've sent a verification code to{' '}
                            <span className="font-medium text-[var(--color-SecondaryText)]">"{email}"</span>
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Code Field */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium mb-2">
                                Verification Code
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faKey} className="h-5 w-5" />
                                </div>
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border rounded-md focus:outline-none focus:border-[var(--color-PrimaryColor)] sm:text-sm transition-all duration-300 placeholder:text-[var(--color-TertiaryText)] ${
                                        getFieldError('Code') || getFieldError('code') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter verification code"
                                    value={code}
                                    onChange={handleInputChange}
                                    maxLength="6"
                                />
                            </div>
                            {(getFieldError('Code') || getFieldError('code')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('Code') || getFieldError('code')}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Confirming...' : 'Confirm Email'}
                            </button>
                        </div>

                        {/* Resend Link */}
                        <div className="text-center">
                            <p className="text-sm text-[var(--color-SecondaryText)]">
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    className="font-medium px-2 py-1 ml-2 text-[var(--color-PrimaryText)] hover:scale-105"
                                    onClick={() => navigate('/auth/register-resend', { state: { email } })}
                                >
                                    Resend
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 