import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export default function EditPassword() {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { updatePassword } = useAuth();

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
            toast.error('New passwords do not match');
            return;
        }

        if (formData.oldPassword === formData.newPassword) {
            toast.error('New password must be different from old password');
            return;
        }

        setIsLoading(true);
        setFieldErrors({});

        try {
            const result = await updatePassword(formData);
            
            if (result.success) {
                toast.success('Password has been updated successfully.');
                navigate('/auth/profile');
            } else {
                if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                    setFieldErrors(result.fieldErrors);
                } else {
                    toast.error(result.error || 'Failed to update password');
                }
            }
        } catch (error) {
            toast.error('An error occurred while updating password');
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="rounded-lg shadow-xl p-8 border border-[var(--color-Line)]">
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/auth/profile')}
                            className="flex items-center space-x-2 text-[var(--color-PrimaryColor)] bg-transparent! hover:underline mb-4"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span>Back to Profile</span>
                        </button>
                        <h2 className="text-3xl font-bold text-center">
                            Edit Password
                        </h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Old Password Field */}
                        <div>
                            <label htmlFor="oldPassword" className="block text-sm font-medium mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
                                </div>
                                <input
                                    id="oldPassword"
                                    name="oldPassword"
                                    type={showOldPassword ? "text" : "password"}
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border rounded-md focus:outline-none focus:border-[var(--color-PrimaryColor)] sm:text-sm transition-all duration-300 placeholder-[var(--color-Placeholder)] ${
                                        getFieldError('OldPassword') || getFieldError('oldPassword') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter current password"
                                    value={formData.oldPassword}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent!"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    <FontAwesomeIcon 
                                        icon={showOldPassword ? faEyeSlash : faEye} 
                                        className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-all duration-300" 
                                    />
                                </button>
                            </div>
                            {(getFieldError('OldPassword') || getFieldError('oldPassword')) && (
                                <div className="text-red-600 text-sm mt-1">
                                    {getFieldError('OldPassword') || getFieldError('oldPassword')}
                                </div>
                            )}
                        </div>

                        {/* New Password Field */}
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
                                </div>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border rounded-md focus:outline-none focus:border-[var(--color-PrimaryColor)] sm:text-sm transition-all duration-300 placeholder-[var(--color-Placeholder)] ${
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
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center bg-transparent!"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <FontAwesomeIcon 
                                        icon={showPassword ? faEyeSlash : faEye} 
                                        className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-all duration-300" 
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
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 pl-10 pr-10  border rounded-md focus:outline-none focus:border-[var(--color-PrimaryColor)] sm:text-sm transition-all duration-300 placeholder-[var(--color-Placeholder)] ${
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
                                    className="absolute bg-transparent! inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <FontAwesomeIcon 
                                        icon={showConfirmPassword ? faEyeSlash : faEye} 
                                        className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-all duration-300" 
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
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>

                        {/* Back to Profile Link */}
                        <div className="text-center">
                            <p className="text-sm text-[var(--color-SecondaryText)]">
                                Changed your mind?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/auth/profile')}
                                    className="font-medium bg-transparent! text-[var(--color-PrimaryColor)] hover:underline ml-1"
                                >
                                    Back to Profile
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
