
'use server';

/**
 * @fileOverview Sends an OTP email to the user.
 *
 * - sendOtpEmail - A function that sends an OTP email.
 * - SendOtpEmailInput - The input type for the sendOtpEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail } from '@/lib/email';

const SendOtpEmailInputSchema = z.object({
  email: z.string().email().describe('The email address to send the OTP to.'),
  name: z.string().describe('The name of the user.'),
  otp: z.string().describe('The One-Time Password to send.'),
});
export type SendOtpEmailInput = z.infer<typeof SendOtpEmailInputSchema>;

export async function sendOtpEmail(input: SendOtpEmailInput): Promise<void> {
  return sendOtpEmailFlow(input);
}

const sendOtpEmailFlow = ai.defineFlow(
  {
    name: 'sendOtpEmailFlow',
    inputSchema: SendOtpEmailInputSchema,
    outputSchema: z.void(),
  },
  async ({ email, name, otp }) => {
    const subject = `Your Herbbify Verification Code`;
    const htmlContent = `
      <h1>Welcome to Herbbify!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your email address:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not sign up for an account, you can safely ignore this email.</p>
      <br/>
      <p>Thanks,</p>
      <p>The Herbbify Team</p>
    `;

    await sendEmail({
      to: [{ email, name }],
      subject,
      htmlContent,
    });
  }
);
