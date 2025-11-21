import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../../data/services/AuthService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Listener para cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [initializing]);

  const register = async (email, password, name, phone) => {
    setIsLoading(true);
    try {
      const newUser = await AuthService.register(email, password, name, phone);
      setUser(newUser);
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const loggedUser = await AuthService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;

    setIsLoading(true);
    try {
      await AuthService.updateUserProfile(user.id, updates);
      setUser({ ...user, ...updates });
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    initializing,
    login,
    logout,
    register,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};