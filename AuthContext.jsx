// AuthContext.jsx

import React, { createContext, useEffect, useState } from 'react';
import { auth } from './firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const loginWithEmail = async (email, password) => {
        return await auth.signInWithEmailAndPassword(email, password);
    };

    const loginWithDemoAccount = async (accountDetails) => {
        // Implement demo account login logic
        // Example: switch currentUser based on predefined demo accounts
    };

    const validateUserRole = (user) => {
        // Implement role validation logic
        // Example: return user.role === 'admin';
    };

    return (
        <AuthContext.Provider value={{ currentUser, loginWithEmail, loginWithDemoAccount, validateUserRole }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};