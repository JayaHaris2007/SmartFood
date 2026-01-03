import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'user' or 'restaurant'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite white screen
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth check timed out, forcing app load");
                setLoading(false);
            }
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!mounted) return;

            if (user) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (mounted) {
                        if (userDoc.exists()) {
                            setUserRole(userDoc.data().role);
                        } else {
                            setUserRole('user');
                        }
                        setCurrentUser(user);
                    }
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    if (mounted) {
                        setUserRole('user');
                        setCurrentUser(user);
                    }
                }
            } else {
                if (mounted) {
                    setCurrentUser(null);
                    setUserRole(null);
                }
            }
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            unsubscribe();
        };
    }, []);

    const loginFn = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const registerFn = async (email, password, role = 'user', name = '', phoneNumber = '') => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Create user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: role, // Use selected role
            name: name,
            phoneNumber: phoneNumber,
            createdAt: new Date().toISOString()
        });
        setUserRole(role);
        return userCredential;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists, if not create profile
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                role: 'user',
                createdAt: new Date().toISOString()
            });
            setUserRole('user');
        } else {
            setUserRole(userDoc.data().role);
        }
        return result;
    };

    const logoutFn = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        userRole,
        login: loginFn,
        register: registerFn,
        loginWithGoogle,
        logout: logoutFn,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
