import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    
    const { login } = useAuth();
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
        setIsLoading(true);
        setFieldErrors({});

        try {
            const result = await login(formData);
            console.log('Login result fe:', result);
            
            if (result.success) {
                toast.success('Login successful!');
                navigate('/');
            } else {
                if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                    setFieldErrors(result.fieldErrors);
                } else {
                    toast.error(result.error || 'Login failed');
                }
            }
        } catch (error) {
            toast.error('An error occurred during login');
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
                        Login
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username/Email Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username or email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('Username') || getFieldError('username') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your username or email"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {(getFieldError('Username') || getFieldError('username')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('Username') || getFieldError('username')}
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link 
                                    to="/auth/forgot-password" 
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    Forgot password ?
                                </Link>
                            </div>
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

                        {/* Remember Me Checkbox */}
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        {/* Login Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Signing in...' : 'Login'}
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 