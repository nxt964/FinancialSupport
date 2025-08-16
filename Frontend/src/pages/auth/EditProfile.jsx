import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        Please log in to edit your profile
                    </h2>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="px-4 py-2 rounded-lg hover:scale-105 hover:opacity-80"
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
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center space-x-2 bg-transparent! text-[var(--color-PrimaryColor)] hover:underline"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Back to Profile</span>
                    </button>
                </div>

                <div className="shadow-lg rounded-lg p-6 border border-[var(--color-Line)]">
                    <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--color-TagBg)] flex items-center justify-center">
                                    {previewUrl ? (
                                        <img 
                                            src={previewUrl} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-[var(--color-SecondaryText)]" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-1 rounded-full! hover:scale-105"
                                >
                                    <FontAwesomeIcon icon={faCamera}/>
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <p className="text-sm text-[var(--color-SecondaryText)]">
                                Click the camera icon to change your profile picture
                            </p>
                        </div>

                        {/* Username Field */}
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
                                </div>
                                <input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:border-[var(--color-PrimaryColor)] transition-all duration-300 sm:text-sm ${
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
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:border-[var(--color-PrimaryColor)] transition-all duration-300 sm:text-sm ${
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
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-4 py-2 rounded-md text-sm font-medium bg-[var(--color-DisableText)]! hover:opacity-80 hover:scale-102"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center space-x-2 px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:opacity-80 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
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