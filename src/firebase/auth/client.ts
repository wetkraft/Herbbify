
'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { initiateEmailPasswordSignUp } from '../non-blocking-login';
import { toast } from '@/hooks/use-toast';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { doc, getDoc, getFirestore, serverTimestamp, updateDoc } from 'firebase/firestore';
import { sendOtpEmail } from '@/ai/flows/send-otp-email-flow';


const { auth } = initializeFirebase();
const provider = new GoogleAuthProvider();

export const handleGoogleSignIn = async (showError: (title: string, description: string) => void) => {
  try {
    const result = await signInWithPopup(auth, provider);
    toast({
      title: 'Signed In',
      description: `Welcome back, ${result.user.displayName}!`,
    });
  } catch (error: any) {
    console.error('Error during Google sign-in:', error);
    showError('Sign In Failed', error.message || 'An unexpected error occurred.');
  }
};

export const handlePasswordReset = async (
  email: string,
  onSuccess: () => void,
  onError: (message: string) => void
) => {
  try {
    await sendPasswordResetEmail(auth, email);
    onSuccess();
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    if (error.code === 'auth/user-not-found') {
      onError('This email is not registered with Herbbify.');
    } else {
      onError(error.message || 'An unexpected error occurred.');
    }
  }
};

export const handleEmailPasswordSignIn = (
  email: string, 
  password: string, 
  showError: (title: string, description: string) => void,
  routerPush: (path: string) => void
) => {
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const userDocRef = doc(getFirestore(auth.app), 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && !userDoc.data().emailVerified) {
        // If email is not verified, keep user logged in but redirect to OTP page
        
        const userData = userDoc.data();
        const now = new Date();
        const otpExpires = userData.otpExpires?.toDate();

        if (!otpExpires || now > otpExpires) {
          // If OTP is expired or doesn't exist, generate and send a new one.
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const newOtpExpires = new Date();
          newOtpExpires.setMinutes(newOtpExpires.getMinutes() + 10);
          
          await updateDoc(userDocRef, { otp, otpExpires: newOtpExpires });
          await sendOtpEmail({ email, name: userCredential.user.displayName || 'user', otp });
          toast({
            title: 'Verification Required',
            description: 'A new verification code has been sent to your email.',
            variant: "destructive"
          });
        } else {
            toast({
                title: 'Verification Required',
                description: 'Please check your email for the verification code.',
                variant: "destructive"
            });
        }
        
        // Redirect to the OTP page. The user remains logged in.
        routerPush(`/verify-otp?uid=${userCredential.user.uid}`);
        return;
      }
      
      // If verified, update last login time
      if (userDoc.exists()){
        await updateDoc(userDocRef, { lastLogin: serverTimestamp() });
      }

      toast({
        title: 'Signed In',
        description: `Welcome back, ${userCredential.user.displayName || userCredential.user.email}!`,
      });
      // The onAuthStateChanged listener in the provider will handle the redirect to dashboard.
      routerPush('/dashboard');
    })
    .catch(error => {
      showError('Sign In Failed', error.code === 'auth/invalid-credential' ? 'Invalid email or password.' : error.message);
    });
};

export const handleEmailPasswordSignUp = (
    email: string, 
    password: string, 
    displayName: string, 
    country: string, 
    showError: (title: string, description: string) => void,
    onSuccess: (uid: string) => void
) => {
  initiateEmailPasswordSignUp(auth, email, password, displayName, country, showError, onSuccess);
};


export const handleSignOut = async (showError: (title: string, description: string) => void) => {
  try {
    await signOut(auth);
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
    });
  } catch (error: any) {
    console.error('Error signing out:', error);
    showError('Sign Out Failed', error.message || 'An unexpected error occurred.');
  }
};
