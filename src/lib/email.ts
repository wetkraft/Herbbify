'use server';

import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY!);

type EmailOptions = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
};

export async function sendEmail({ to, subject, htmlContent, textContent }: EmailOptions) {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: process.env.BREVO_SENDER_EMAIL!,
    name: process.env.BREVO_SENDER_NAME!,
  };
  sendSmtpEmail.to = to;
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.textContent = textContent;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
