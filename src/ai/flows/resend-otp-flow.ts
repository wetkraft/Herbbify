
'use server';

/**
 * @fileOverview A flow to resend an OTP code to a user.
 * 
 * - resendOtp - A function to generate and send a new OTP.
 * - ResendOtpInput - The input type for the resendOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb } from '@/firebase/admin';
import { sendEmail } from '@/lib/email';


const ResendOtpInputSchema = z.object({
  userId: z.string().describe("The user's unique ID (UID)."),
});
export type ResendOtpInput = z.infer<typeof ResendOtpInputSchema>;


export async function resendOtp(input: ResendOtpInput): Promise<void> {
  return resendOtpFlow(input);
}


const resendOtpFlow = ai.defineFlow(
  {
    name: 'resendOtpFlow',
    inputSchema: ResendOtpInputSchema,
    outputSchema: z.void(),
  },
  async ({ userId }) => {
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
        throw new Error("This account has already been verified.");
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date();
      otpExpires.setMinutes(otpExpires.getMinutes() + 10);

      await userDocRef.update({
        otp: otp,
        otpExpires: otpExpires,
      });

      await sendEmail({
        to: [{ email: userData.email, name: userData.displayName }],
        subject: "Your New Herbbify Verification Code",
        htmlContent: `
            <h1>Here is your new code</h1>
            <p>Hello ${userData.displayName},</p>
            <p>Please use the following One-Time Password (OTP) to verify your email address for Herbbify:</p>
            <h2>${otp}</h2>
            <p>This code will expire in 10 minutes.</p>
        `,
      });

    } catch (error: any) {
      console.error(`[resendOtpFlow] Error for user ${userId}:`, error);
      // Re-throw the error to be caught by the client-side caller
      throw new Error(error.message || "An unexpected error occurred while resending the OTP.");
    }
  }
);
