import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { httpClient } from '../../utils/httpClient';

export default function ResetPassword() {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { email, resetToken } = location.state || {};

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!email || !resetToken) {
            toast.error('Invalid reset session. Please try again.');
            navigate('/auth/forgot-password');
            return;
        }

        setIsLoading(true);
        setFieldErrors({});

        try {
            const response = await httpClient.post('/api/auth/reset-password', {
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword,
                resetToken: resetToken,
                email: email
            });
            const data = await response.json();
            
            if (response.ok && data.succeeded) {
                toast.success('Password has been reset successfully.');
                navigate('/auth/login');
            } else {
                if (data.errors && typeof data.errors === 'object') {
                    setFieldErrors(data.errors);
                } else {
                    toast.error(data.message || 'Failed to reset password');
                }
            }
        } catch (error) {
            toast.error('An error occurred while resetting password');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
    };

    if (!email || !resetToken) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Invalid Reset Session
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Please request a new password reset.
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
                            onClick={() => navigate('/auth/reset-password-confirm')}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Back to Code Verification</span>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            Reset Password
                        </h2>
                        <p className="text-sm text-gray-600 text-center mt-2">
                            Enter your new password below.
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password Field */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('NewPassword') || getFieldError('newPassword') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter new password"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <FontAwesomeIcon 
                                        icon={showPassword ? faEyeSlash : faEye} 
                                        className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                                    />
                                </button>
                            </div>
                            {(getFieldError('NewPassword') || getFieldError('newPassword')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('NewPassword') || getFieldError('newPassword')}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('ConfirmPassword') || getFieldError('confirmPassword') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Confirm new password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <FontAwesomeIcon 
                                        icon={showConfirmPassword ? faEyeSlash : faEye} 
                                        className="h-5 w-5 text-gray-400 hover:text-gray-600" 
                                    />
                                </button>
                            </div>
                            {(getFieldError('ConfirmPassword') || getFieldError('confirmPassword')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('ConfirmPassword') || getFieldError('confirmPassword')}
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
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>

                        {/* Back to Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Remember your password?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/auth/login')}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Back to login
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 