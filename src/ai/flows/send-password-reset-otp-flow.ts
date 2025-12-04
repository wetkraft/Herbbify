
'use server';

/**
 * @fileOverview A flow to send a password reset OTP to a user.
 *
 * - sendPasswordResetOtp - A function to generate and send an OTP for password reset.
 * - SendPasswordResetOtpInput - The input type for the sendPasswordResetOtp function.
 * - SendPasswordResetOtpOutput - The return type for the sendPasswordResetOtp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminDb, adminAuth } from '@/firebase/admin';
import { sendEmail } from '@/lib/email';

const SendPasswordResetOtpInputSchema = z.object({
  email: z.string().email().describe('The email address of the user requesting a password reset.'),
});
export type SendPasswordResetOtpInput = z.infer<typeof SendPasswordResetOtpInputSchema>;

const SendPasswordResetOtpOutputSchema = z.object({
    success: z.boolean(),
    message: z.string().optional(),
});
export type SendPasswordResetOtpOutput = z.infer<typeof SendPasswordResetOtpOutputSchema>;


export async function sendPasswordResetOtp(input: SendPasswordResetOtpInput): Promise<SendPasswordResetOtpOutput> {
  return sendPasswordResetOtpFlow(input);
}


const sendPasswordResetOtpFlow = ai.defineFlow(
  {
    name: 'sendPasswordResetOtpFlow',
    inputSchema: SendPasswordResetOtpInputSchema,
    outputSchema: SendPasswordResetOtpOutputSchema,
  },
  async ({ email }) => {
    try {
        // 1. Verify user exists in Firebase Auth
        const userRecord = await adminAuth.getUserByEmail(email);
        const userDocRef = adminDb.collection('users').doc(userRecord.uid);
        
        // 2. Verify user profile exists in Firestore
        const userDoc = await userDocRef.get();
        if (!userDoc.exists) {
            // This is an edge case where an auth user exists but has no profile document.
            return { success: false, message: 'User profile not found. Please contact support.' };
        }
      
        // 3. Generate OTP and expiration
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date();
        otpExpires.setMinutes(otpExpires.getMinutes() + 10);

        // 4. Update Firestore with new OTP
        await userDocRef.update({
            otp: otp,
            otpExpires: otpExpires,
        });

        // 5. Send email via Brevo
        await sendEmail({
            to: [{ email: email, name: userRecord.displayName || 'User' }],
            subject: "Your Password Reset Code for Herbbify",
            htmlContent: `
                <h1>Password Reset Request</h1>
                <p>Hello ${userRecord.displayName || 'User'},</p>
                <p>Please use the following One-Time Password (OTP) to reset your password for Herbbify:</p>
                <h2>${otp}</h2>
                <p>This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
            `,
        });
        
        // 6. Return success
        return { success: true };

    } catch (error: any) {
        console.error(`[sendPasswordResetOtpFlow] Error for email ${email}:`, error);
        // Handle specific error for user not found in Auth
        if (error.code === 'auth/user-not-found') {
            return { success: false, message: 'This email is not registered with Herbbify.' };
        }
        // Handle all other errors
        return { success: false, message: "An unexpected error occurred. Please try again." };
    }
  }
);
