import React, { createContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Create the context with default values
const AuthContext = createContext({
    user: null,
    userLoggedIn: false,

    currentUser: null,
    loading: true,
    userRole: null,
    doSignInWithEmailAndPassword: () => {},
    doSignInWithGoogle: () => {},
    doSignOut: () => {},
    doCreateUserWithEmailAndPassword: () => {},
    doSendEmailVerification: () => {},
    doSendPasswordResetEmail: () => {},
    doCheckEmailExists: () => Promise.resolve(false)
});

// Custom hook to use the auth context
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider component
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setUserLoggedIn(!!user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const doSignInWithEmailAndPassword = React.useCallback(async (email, password, loginAsAdmin) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const adminConfigRef = doc(db, 'site_content', 'admins');
        const adminConfigSnap = await getDoc(adminConfigRef);
        const isAdmin = adminConfigSnap.exists() && adminConfigSnap.data().email?.includes(user.email);

        let role = null;
        if (loginAsAdmin) {
            if (isAdmin) {
                role = 'admin';
            } else {
                role = 'unauthorized_admin'; // User tried to log in as admin but is not one.
            }
        } else {
            role = isAdmin ? 'admin' : 'salesman'; // If not trying for admin, assign role normally.
        }
        
        setUserRole(role);
        return userCredential;
    }, []);

    const doSignInWithGoogle = React.useCallback(() => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
    }, []);

    const doSignOut = React.useCallback(() => {
        setUserRole(null);
        return signOut(auth);
    }, []);

    const doCreateUserWithEmailAndPassword = React.useCallback((email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }, []);

    const doSendEmailVerification = React.useCallback(() => {
        return sendEmailVerification(auth.currentUser, {
            url: `${window.location.origin}/login`,
        });
    }, []);

    const doSendPasswordResetEmail = React.useCallback((email) => {
        return sendPasswordResetEmail(auth, email, {
            url: `${window.location.origin}/login`,
        });
    }, []);

    const doCheckEmailExists = React.useCallback(async (email) => {
        console.log("AuthContext: Checking email:", email); // Debugging line
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            console.log("AuthContext: Firebase sign-in methods for", email, ":", methods); // Debugging line
            return methods.length > 0;
        } catch (error) {
            console.error("AuthContext: Error checking email existence:", error); // Debugging line
            return false;
        }
    }, []);

    const value = React.useMemo(() => ({
        currentUser,
        userLoggedIn,
        loading,
        userRole,
        doSignInWithEmailAndPassword,
        doSignInWithGoogle,
        doSignOut,
        doCreateUserWithEmailAndPassword,
        doSendEmailVerification,
        doSendPasswordResetEmail,
        doCheckEmailExists,
    }), [currentUser, userLoggedIn, loading, userRole, doSignInWithEmailAndPassword, doSignInWithGoogle, doSignOut, doCreateUserWithEmailAndPassword, doSendEmailVerification, doSendPasswordResetEmail, doCheckEmailExists]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Export the AuthContext for direct usage if needed
export { AuthContext };

export default AuthProvider;
