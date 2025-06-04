import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
    currentUser: import("firebase/auth").User | null;
    userLoggedIn: boolean;
    loading: boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
    const [currentUser, setCurrentUser] = useState<import("firebase/auth").User | null>(null);
    const [ userLoggedIn, setUserLoggedIn ] = useState(false);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user: import("firebase/auth").User | null) {
        if (user){
            setCurrentUser({...user});
            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
        }
        setLoading(false);
    }

    const value = {
        currentUser,
        userLoggedIn,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

