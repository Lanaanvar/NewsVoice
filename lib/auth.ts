import { create } from 'node:domain';
import { auth } from './../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, Auth, updatePassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { sign } from 'node:crypto';
import { send } from 'node:process';
import Home from '@/app/page';

export const doCreateUserWithEmailAndPassword = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result;
}

export const doSignOut = async () => {
    return auth.signOut();
};

export const doResetPassword = async (email: string) => {
    return sendPasswordResetEmail(auth, email);
};

export const doUpdatePassword = async (password: string) => {
    if (!auth.currentUser) {
        throw new Error('No authenticated user.');
    }
    return updatePassword(auth.currentUser, password);
}

export const doSendEmailVerification = () => {
    if (!auth.currentUser) {
        throw new Error('No authenticated user.');
    }
    return sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/Home`,
    });
};

