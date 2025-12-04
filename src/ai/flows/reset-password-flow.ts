
'use server';

/**
 * @fileOverview A flow to reset a user's password using an OTP.
 *
 * - resetPassword - A function to verify the OTP and reset the password.
 * - ResetPasswordInput - The input type for the resetPassword function.
 * - ResetPasswordOutput - The return type for the resetPassword function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb, adminAuth } from '@/firebase/admin';

const ResetPasswordInputSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

const ResetPasswordOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type ResetPasswordOutput = z.infer<typeof ResetPasswordOutputSchema>;

export async function resetPassword(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
  return resetPasswordFlow(input);
}

const resetPasswordFlow = ai.defineFlow(
  {
    name: 'resetPasswordFlow',
    inputSchema: ResetPasswordInputSchema,
    outputSchema: ResetPasswordOutputSchema,
  },
  async ({ email, otp, newPassword }) => {
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      const userDocRef = adminDb.collection('users').doc(userRecord.uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        return { success: false, message: 'User profile not found.' };
      }

      const userData = userDoc.data();
      if (!userData) {
        return { success: false, message: 'User data could not be read.' };
      }

      if (userData.otp !== otp) {
        return { success: false, message: 'Invalid OTP provided.' };
      }

      const now = new Date();
      const otpExpires = userData.otpExpires.toDate();
      if (now > otpExpires) {
        return { success: false, message: 'Your OTP has expired. Please request a new one.' };
      }

      // OTP is valid, proceed to update password in Firebase Auth
      await adminAuth.updateUser(userRecord.uid, {
        password: newPassword,
      });

      // Clear the OTP fields in Firestore
      await userDocRef.update({
        otp: null,
        otpExpires: null,
      });

      return { success: true };

    } catch (error: any) {
      console.error("🔥 FULL ERROR DUMP 🔥");
      console.error("Message:", error?.message);
      console.error("Code:", error?.code);
      console.error("Stack:", error?.stack);
      try {
        console.error("JSON:", JSON.stringify(error, null, 2));
      } catch (_) {
        console.error("Unable to stringify error");
      }

      if (error.code === "auth/user-not-found") {
        return { success: false, message: "This email is not registered with Herbbify." };
      }

      return { success: false, message: "An unexpected error occurred. Please try again." };
    }
  }
);
