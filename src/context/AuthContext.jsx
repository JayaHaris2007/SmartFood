import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    sendEmailVerification,
    deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'user' or 'restaurant'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        let unsubscribeUser = null; // Store user listener

        // Safety timeout to prevent infinite white screen
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out, forcing app load");
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!mounted) return;

            // Unsubscribe from previous user listener if it exists
            if (unsubscribeUser) {
                unsubscribeUser();
                unsubscribeUser = null;
            }

            if (user) {
                // Listen for real-time user updates
                unsubscribeUser = onSnapshot(doc(db, "users", user.uid), (docSnapshot) => {
                    if (mounted) {
                        if (docSnapshot.exists()) {
                            const data = docSnapshot.data();
                            setUserRole(data.role);
                            setCurrentUser({ ...user, ...data });
                        } else {
                            // Creates a provisional user state if doc doesn't exist yet
                            setUserRole('user');
                            setCurrentUser(user);
                        }
                        setLoading(false);
                    }
                }, (error) => {
                    console.error("Error listening to user data:", error);
                    if (mounted) {
                        setUserRole('user');
                        setCurrentUser(user);
                        setLoading(false);
                    }
                });
            } else {
                if (mounted) {
                    setCurrentUser(null);
                    setUserRole(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            unsubscribe();
            if (unsubscribeUser) {
                unsubscribeUser();
            }
        };
    }, []);

    const loginFn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const registerFn = async (email, password, role = 'user', name = '', phoneNumber = '', location = null) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Create user profile in Firestore
        const userData = {
            email: user.email,
            role: role, // Use selected role
            name: name,
            phoneNumber: phoneNumber,
            createdAt: new Date().toISOString()
        };

        if (location) {
            userData.location = location;
        }

        await setDoc(doc(db, "users", user.uid), userData);
        await sendEmailVerification(user);
        setUserRole(role);
        return userCredential;
    };

    const loginWithGoogle = async (requestedRole = 'user', additionalData = {}) => {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists, if not create profile
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user: Create with requested role and additional data
            const userData = {
                email: user.email,
                role: requestedRole,
                name: additionalData.name || user.displayName || '',
                phoneNumber: additionalData.phoneNumber || '',
                createdAt: new Date().toISOString()
            };

            if (additionalData.location) {
                userData.location = additionalData.location;
            }

            await setDoc(userDocRef, userData);
            setUserRole(requestedRole);
            setCurrentUser({ ...user, ...userData });
        } else {
            // Existing user: Ignore requested role/data, use existing
            const data = userDoc.data();
            setUserRole(data.role);
            setCurrentUser({ ...user, ...data });
        }
        return result;
    };

    const logoutFn = async () => {
        await signOut(auth);
        setCurrentUser(null);
        setUserRole(null);
        setLoading(false);
    };

    const resendVerificationEmail = () => {
        if (currentUser) {
            return sendEmailVerification(currentUser);
        }
    };

    const deleteAccount = async () => {
        if (!currentUser) return;

        try {
            // Delete user document from Firestore
            await deleteDoc(doc(db, "users", currentUser.uid));

            // Delete user from Firebase Auth
            await deleteUser(currentUser);

            setCurrentUser(null);
            setUserRole(null);
            setLoading(false);
            return true;
        } catch (error) {
            console.error("Error deleting account:", error);
            throw error;
        }
    };

    const value = {
        currentUser,
        userRole,
        login: loginFn,
        register: registerFn,
        loginWithGoogle,
        logout: logoutFn,
        deleteAccount,
        resendVerificationEmail,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
