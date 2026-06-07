import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || 're_test');
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';

export const sendRegistrationReceived = async (leadEmail, teamName, teamId, members, eventName) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[EMAIL] RESEND_API_KEY not configured. Skipping email send.');
    return;
  }
  try {
    await resend.emails.send({
      from: fromEmail,
      to: leadEmail,
      subject: `Registration Received – ${teamName} | NOVA`,
      html: `
        <h2>Registration Received</h2>
        <p>Hi there,</p>
        <p>We have successfully received your registration for <strong>${eventName || 'our upcoming event'}</strong>!</p>
        <p><strong>Team Name:</strong> ${teamName}</p>
        <p><strong>Team ID:</strong> ${teamId}</p>
        <p><strong>Members:</strong> ${members.join(', ')}</p>
        <p><em>Note: Your payment verification is currently pending. You will receive another email once your registration is confirmed.</em></p>
        <p>Best regards,<br/>NOVA Team</p>
      `
    });
    console.log(`[EMAIL] Registration received email sent to ${leadEmail}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send registration email:', error);
  }
};

export const sendPaymentVerified = async (leadEmail, teamName, teamId, eventName) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: fromEmail,
      to: leadEmail,
      subject: `You're In! Registration Confirmed – ${teamName} | NOVA`,
      html: `
        <h2>Registration Confirmed!</h2>
        <p>Hi there,</p>
        <p>Your payment has been verified and your registration for <strong>${eventName || 'our upcoming event'}</strong> is officially confirmed!</p>
        <p><strong>Team ID:</strong> ${teamId}</p>
        <p>Please keep your Team ID safe. We look forward to seeing you at the event.</p>
        <p>Best regards,<br/>NOVA Team</p>
      `
    });
    console.log(`[EMAIL] Payment verified email sent to ${leadEmail}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send payment verified email:', error);
  }
};

export const sendEventReminder = async (leadEmail, teamName, eventName, startTime, venue) => {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: fromEmail,
      to: leadEmail,
      subject: `Reminder: ${eventName} is tomorrow! | NOVA`,
      html: `
        <h2>Event Reminder</h2>
        <p>Hi ${teamName},</p>
        <p>This is a quick reminder that <strong>${eventName}</strong> is happening tomorrow!</p>
        <p><strong>Start Time:</strong> ${startTime || 'TBA'}</p>
        <p><strong>Venue:</strong> ${venue || 'TBA'}</p>
        <p>Get ready for an amazing experience. See you there!</p>
        <p>Best regards,<br/>NOVA Team</p>
      `
    });
    console.log(`[EMAIL] Event reminder email sent to ${leadEmail}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send reminder email:', error);
  }
};
