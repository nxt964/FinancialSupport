import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export default function Signup() {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { signup } = useAuth();
    const navigate = useNavigate();

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
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setFieldErrors({});

        try {
            const result = await signup({
                userName: formData.userName,
                email: formData.email,
                password: formData.password
            });
            
            if (result.success) {
                toast.success('Account created successfully! Please check your email for confirmation.');
                navigate('/auth/confirm-email', { 
                    state: { email: formData.email } 
                });
            } else {
                if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                    setFieldErrors(result.fieldErrors);
                } else {
                    toast.error(result.error || 'Signup failed');
                }
            }
        } catch (error) {
            toast.error('An error occurred during signup');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                        Create Account
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('UserName') || getFieldError('userName') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your username"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {(getFieldError('UserName') || getFieldError('userName')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('UserName') || getFieldError('userName')}
                                </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('Email') || getFieldError('email') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {(getFieldError('Email') || getFieldError('email')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('Email') || getFieldError('email')}
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('Password') || getFieldError('password') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your password"
                                    value={formData.password}
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
                            {(getFieldError('Password') || getFieldError('password')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('Password') || getFieldError('password')}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
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
                                    placeholder="Confirm your password"
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
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 