import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faCamera, faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

export default function EditProfile() {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        userName: user?.userName || '',
        email: user?.email || ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profileImage || '');

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Please log in to edit your profile
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size must be less than 5MB');
                return;
            }
            
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});

        try {
            const updateData = {
                userName: formData.userName,
                email: formData.email
            };

            // If there's a new image, convert to base64
            if (selectedImage) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const base64 = e.target.result.split(',')[1];
                    updateData.profileImage = `data:${selectedImage.type};base64,${base64}`;
                    
                    const result = await updateProfile(updateData);
                    handleUpdateResult(result);
                };
                reader.readAsDataURL(selectedImage);
            } else {
                const result = await updateProfile(updateData);
                handleUpdateResult(result);
            }
        } catch (error) {
            toast.error('An error occurred while updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateResult = (result) => {
        if (result.success) {
            toast.success('Profile updated successfully!');
            navigate('/profile');
        } else {
            if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                setFieldErrors(result.fieldErrors);
            } else {
                toast.error(result.error || 'Update failed');
            }
        }
    };

    const getFieldError = (fieldName) => {
        return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Back to Profile</span>
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-gray-400" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faCamera} className="w-4 h-4" />
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <p className="text-sm text-gray-500">
                                Click the camera icon to change your profile picture
                            </p>
                        </div>

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
                                    className={`appearance-none relative block w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('UserName') || getFieldError('userName') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter username"
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
                                Email
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
                                    className={`appearance-none relative block w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 ${
                                        getFieldError('Email') || getFieldError('email') 
                                            ? 'border-red-500' 
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Enter email"
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

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FontAwesomeIcon icon={faSave} />
                                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 