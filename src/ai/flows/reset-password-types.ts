
import { z } from 'genkit';

/**
 * @fileOverview Type definitions for the password reset flow.
 *
 * - ResetPasswordInput - The input type for the resetPassword function.
 * - ResetPasswordOutput - The return type for the resetPassword function.
 */

export const ResetPasswordInputSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

export const ResetPasswordOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type ResetPasswordOutput = z.infer<typeof ResetPasswordOutputSchema>;
