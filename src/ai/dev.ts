
import { config } from 'dotenv';
config();

import '@/ai/flows/herbal-recommendation-from-symptoms.ts';
import '@/ai/flows/preparation-instructions-flow.ts';
import '@/ai/flows/generate-herbs-image-flow.ts';
import '@/ai/flows/summarize-remedy-flow.ts';
import '@/ai/flows/summarize-instructions-flow.ts';
import '@/ai/flows/send-otp-email-flow.ts';
import '@/ai/flows/resend-otp-flow.ts';
import '@/ai/flows/verify-otp-flow.ts';
import '@/ai/flows/send-password-reset-otp-flow.ts';
import '@/ai/flows/reset-password-flow.ts';
import '@/ai/flows/text-to-speech-flow.ts';
import '@/ai/flows/generate-remedy-calendar-flow.ts';

