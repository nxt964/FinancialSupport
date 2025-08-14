import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { httpClient } from '../../utils/httpClient';

export default function ResetPasswordConfirm() {
    const [code, setCode] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
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
            const response = await httpClient.post('/api/auth/confirm-reset-password-request', { 
                email, 
                code 
            });
            const data = await response.json();
            
            if (response.ok && data.succeeded) {
                toast.success('Reset code is valid.');
                navigate('/auth/reset-password', { 
                    state: { 
                        email: email,
                        resetToken: data.result.resetToken 
                    } 
                });
            } else {
                if (data.errors && typeof data.errors === 'object') {
                    setFieldErrors(data.errors);
                } else {
                    toast.error(data.message || 'Invalid reset code');
                }
            }
        } catch (error) {
            toast.error('An error occurred while validating reset code');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
    };

    if (!email) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Invalid Access
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Please request a password reset first.
                        </p>
                        <button
                            onClick={() => navigate('/auth/forgot-password')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go to Forgot Password
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/auth/forgot-password')}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Back to Forgot Password</span>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            Enter Reset Code
                        </h2>
                        <p className="text-sm text-gray-600 text-center mt-2">
                            We've sent a verification code to{' '}
                            <span className="font-medium text-gray-900">{email}</span>
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Code Field */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                Verification Code
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faKey} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="code"
                                    name="code"
                                    type="text"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
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
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </div>

                        {/* Resend Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                    onClick={() => navigate('/auth/reset-password-request-resend', { state: { email } })}
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