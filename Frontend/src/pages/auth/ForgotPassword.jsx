import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { httpClient } from '../../utils/httpClient';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { value } = e.target;
        setEmail(value);
        // Clear field error when user starts typing
        if (fieldErrors.email) {
            setFieldErrors(prev => ({
                ...prev,
                email: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        setFieldErrors({});

        try {
            const response = await httpClient.post('/api/auth/reset-password-request', { email });
            const data = await response.json();
            
            if (response.ok && data.succeeded) {
                toast.success('Reset password code sent to your email.');
                navigate('/auth/reset-password-confirm', { 
                    state: { email: email } 
                });
            } else {
                if (data.errors && typeof data.errors === 'object') {
                    setFieldErrors(data.errors);
                } else {
                    toast.error(data.message || 'Failed to send reset code');
                }
            }
        } catch (error) {
            toast.error('An error occurred while sending reset code');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full border border-[var(--color-Line)] rounded-2xl">
                <div className="rounded-lg shadow-xl p-8">
                    <div className="mb-4">
                        <h2 className="text-4xl font-bold text-center mb-4 text-[var(--color-PrimaryColor)]">
                            Reset Password
                        </h2>
                        <p className="text-sm text-[var(--color-SecondaryText)] text-center mt-2">
                            Enter your email address and we'll send you a code to reset your password.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-SecondaryText)] mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`appearance-none bg-transparent relative block w-full px-3 py-3 pl-10 border rounded-md focus:outline-none focus:border-[var(--color-PrimaryColor)] sm:text-sm transition-all duration-300 placeholder:text-[var(--color-TertiaryText)] ${
                                        getFieldError('Email') || getFieldError('email') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {(getFieldError('Email') || getFieldError('email')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('Email') || getFieldError('email')}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </div>

                        {/* Back to Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-[var(--color-SecondaryText)]">
                                Remember your password?{' '}
                                <Link to="auth/login" className="font-medium text-[var(--color-PrimaryColor)] hover:underline">
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 