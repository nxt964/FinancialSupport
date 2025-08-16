import React, { createContext, useContext, useState, useEffect } from 'react';
import { httpClient } from '../utils/httpClient';

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (accessToken && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        httpClient.clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const parseValidationErrors = (data) => {
    if (data.errors && typeof data.errors === 'object') {
      // Handle FluentValidation field-specific errors
      const fieldErrors = {};
      const generalErrors = [];
      
      Object.keys(data.errors).forEach(field => {
        if (Array.isArray(data.errors[field])) {
          fieldErrors[field] = data.errors[field];
          generalErrors.push(...data.errors[field]);
        }
      });
      
      return {
        fieldErrors,
        generalErrors: generalErrors.length > 0 ? generalErrors : [data.message || 'Request failed']
      };
    } else if (data.errors && Array.isArray(data.errors)) {
      // Handle array of general errors
      return {
        fieldErrors: {},
        generalErrors: data.errors
      };
    } else {
      // Handle single error message
      return {
        fieldErrors: {},
        generalErrors: [data.message || 'Request failed']
      };
    }
  };

  const login = async (loginData) => {
    try {
      const response = await httpClient.post('/api/auth/login', loginData);
      const data = await response.json();
      
      if (response.ok && data.succeeded) {
        const userData = data.result;
        console.log('User data:', userData);
        httpClient.setTokens(userData.accessToken, userData.refreshToken);
        const userInfo = {
          id: userData.id,
          userName: userData.userName,
          email: userData.email,
          profileImage: userData.profileImage,
          role: userData.role
        };
        setUser(userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        return { success: true, data: userData };
      } else {
        console.error('Login error:', data.errors);
        const { fieldErrors, generalErrors } = parseValidationErrors(data);
        return { 
          success: false, 
          error: generalErrors[0],
          fieldErrors 
        };
      }
    } catch (error) {
      return { success: false, error: `Error: ${error}` };
    }
  };

  const signup = async (signupData) => {
    try {
      const response = await httpClient.post('/api/auth/register', signupData);
      console.log('Signup response:', response);
      const data = await response.json();
      console.log('Signup data:', data);
      
      if (response.ok && data.succeeded) {
        return { success: true, data: data.result };
      } else {
        const { fieldErrors, generalErrors } = parseValidationErrors(data);
        return { 
          success: false, 
          error: generalErrors[0],
          fieldErrors 
        };
      }
    } catch (error) {
      return { success: false, error: `Error: ${error}` };
    }
  };

  const confirmEmail = async (email, code) => {
    try {
      const response = await httpClient.post('/api/auth/confirm-register', { email, code });
      const data = await response.json();
      
      if (response.ok && data.succeeded) {
        return { success: true, data: data.result };
      } else {
        const { fieldErrors, generalErrors } = parseValidationErrors(data);
        return { 
          success: false, 
          error: generalErrors[0],
          fieldErrors 
        };
      }
    } catch (error) {
      return { success: false, error: `Error: ${error}` };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await httpClient.put('/api/users/update', {
        id: user.id,
        newUsername: profileData.userName,
        newEmail: profileData.email,
        newProfileImage: profileData.profileImage || ''
      });
      const data = await response.json();
      
      if (response.ok && data.succeeded) {
        // Update local user state
        const updatedUser = {
          ...user,
          userName: profileData.userName,
          email: profileData.email,
          profileImage: profileData.profileImage || user.profileImage
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          fieldErrors: {}
        };
      } else {
        const { fieldErrors, generalErrors } = parseValidationErrors(data);
        return {
          success: false,
          fieldErrors,
          error: generalErrors.length > 0 ? generalErrors[0] : 'Update failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `An error occurred while updating profile: ${error}`
      };
    }
  };

  const logout = async () => {
    try {
      if (user && httpClient.accessToken) {
        await httpClient.post('/api/auth/logout', { 
          id: user.id, 
          accessToken: httpClient.accessToken 
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      httpClient.clearTokens();
      localStorage.removeItem('user');
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      confirmEmail,
      updateProfile,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}; 