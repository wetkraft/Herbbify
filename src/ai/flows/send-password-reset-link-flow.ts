
'use server';

/**
 * @fileOverview A flow to send a password reset link to a user via Brevo.
 * 
 * - sendPasswordResetLink - A function to generate a link and email it.
 * - SendPasswordResetLinkInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { adminAuth } from '@/firebase/admin';
import { sendEmail } from '@/lib/email';

const SendPasswordResetLinkInputSchema = z.object({
  email: z.string().email().describe("The user's email address."),
});
export type SendPasswordResetLinkInput = z.infer<typeof SendPasswordResetLinkInputSchema>;

export async function sendPasswordResetLink(input: SendPasswordResetLinkInput): Promise<void> {
  return sendPasswordResetLinkFlow(input);
}

const sendPasswordResetLinkFlow = ai.defineFlow(
  {
    name: 'sendPasswordResetLinkFlow',
    inputSchema: SendPasswordResetLinkInputSchema,
    outputSchema: z.void(),
  },
  async ({ email }) => {
    try {
      // Check if user exists
      const user = await adminAuth.getUserByEmail(email);

      // Generate password reset link
      const link = await adminAuth.generatePasswordResetLink(email);

      // Send email using Brevo
      await sendEmail({
        to: [{ email: user.email!, name: user.displayName || 'Herbbify User' }],
        subject: 'Reset Your Herbbify Password',
        htmlContent: `
          <h1>Reset Your Password</h1>
          <p>Hello ${user.displayName || 'Herbbify User'},</p>
          <p>We received a request to reset your password. Click the link below to set a new password:</p>
          <a href="${link}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email.</p>
          <br/>
          <p>Thanks,</p>
          <p>The Herbbify Team</p>
        `,
      });

    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // To prevent user enumeration, we don't throw an error here.
        // The UI will show a generic success message regardless.
        console.log(`Password reset requested for non-existent user: ${email}`);
        return; 
      }
      console.error(`[sendPasswordResetLinkFlow] Error for email ${email}:`, error);
      // Re-throw other errors to be caught by the client-side caller
      throw new Error(error.message || "An unexpected error occurred while sending the password reset link.");
    }
  }
);
