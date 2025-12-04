
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { setDoc, doc, getFirestore, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { sendOtpEmail } from '@/ai/flows/send-otp-email-flow';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, showError: (title: string, description: string) => void): void {
  signInAnonymously(authInstance).catch(error => {
    showError('Sign In Failed', error.message || 'An unexpected error occurred.');
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailPasswordSignUp(
  authInstance: Auth, 
  email: string, 
  password: string, 
  displayName: string, 
  country: string, 
  showError: (title: string, description: string) => void,
  onSuccess: (uid: string) => void
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(async (userCredential) => {
      
      await updateProfile(userCredential.user, { displayName });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date();
      otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes

      const userDocRef = doc(getFirestore(authInstance.app), 'users', userCredential.user.uid);
      
      // CRITICAL: Await the profile creation before sending the email.
      try {
        await setDoc(userDocRef, {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName,
          country: country,
          firstName: '',
          lastName: '',
          signUpDate: serverTimestamp(),
          lastLogin: serverTimestamp(),
          plan: 'Free',
          preparationCreditsUsed: 0,
          savedRemediesCreditsUsed: 0,
          socialPostDownloadCreditsUsed: 0,
          emailVerified: false,
          otp,
          otpExpires,
        });

        // Only send email and proceed if the profile was successfully created
        await sendOtpEmail({ email, name: displayName, otp });

        toast({
          title: 'Account Created',
          description: 'A verification code has been sent to your email.',
        });

        onSuccess(userCredential.user.uid);
      } catch (dbError: any) {
        console.error("Failed to create user profile in Firestore:", dbError);
        showError('Sign Up Failed', 'Could not save user profile. Please try again.');
        // Optional: delete the just-created auth user to allow them to retry
        await userCredential.user.delete();
      }
    })
    .catch(error => {
      showError('Sign Up Failed', error.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : 'Could not create account.');
    });
}
