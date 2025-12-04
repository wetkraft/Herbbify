
'use server';

/**
 * @fileOverview A flow to verify a user's OTP.
 *
 * - verifyOtp - A function to check the OTP and mark the user as verified.
 * - VerifyOtpInput - The input type for the verifyOtp function.
 * - VerifyOtpOutput - The return type for the verifyOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/firebase/admin';

const VerifyOtpInputSchema = z.object({
  userId: z.string().describe("The user's unique ID (UID)."),
  otp: z.string().length(6).describe('The 6-digit OTP code.'),
});
export type VerifyOtpInput = z.infer<typeof VerifyOtpInputSchema>;

const VerifyOtpOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type VerifyOtpOutput = z.infer<typeof VerifyOtpOutputSchema>;


export async function verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
  return verifyOtpFlow(input);
}


const verifyOtpFlow = ai.defineFlow(
  {
    name: 'verifyOtpFlow',
    inputSchema: VerifyOtpInputSchema,
    outputSchema: VerifyOtpOutputSchema,
  },
  async ({ userId, otp }) => {
    const userDocRef = adminDb.collection('users').doc(userId);

    try {
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        throw new Error("User not found.");
      }
      
      const userData = userDoc.data();
      if (!userData) {
          throw new Error("User data not found.");
      }

      if (userData.emailVerified) {
         return { success: true, message: "Email has already been verified." };
      }

      if (userData.otp !== otp) {
        throw new Error('Invalid OTP. Please check the code and try again.');
      }

      const now = new Date();
      const otpExpires = userData.otpExpires.toDate();

      if (now > otpExpires) {
        throw new Error('Your OTP has expired. Please request a new one.');
      }

      // OTP is valid, update user doc
      await userDocRef.update({
        emailVerified: true,
        otp: null,
        otpExpires: null,
      });

      return { success: true, message: "Account verified successfully." };

    } catch (error: any) {
      console.error(`[verifyOtpFlow] Error for user ${userId}:`, error);
      // Re-throw the error to be caught by the client-side caller
      throw new Error(error.message || "An unexpected error occurred during verification.");
    }
  }
);
