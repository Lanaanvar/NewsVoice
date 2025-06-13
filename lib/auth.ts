import { auth } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';


export const doSignInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Add scopes if you need to access Google APIs
    provider.addScope('profile');
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Get ID token (for user identity)
    const idToken = await user.getIdToken(true);
    
    // Get access token (for Google API access)
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    
    console.log('🚀 Google sign-in result:', { 
      user, 
      idToken,
      accessToken 
    });

    return {
      user,
      idToken
    };
  } catch (error) {
    console.error('❌ Google sign-in error:', error);
    throw error;
  }
};



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
};

export const doSendEmailVerification = () => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user.');
  }
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/Home`,
  });
};