import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function sendReceiptEmail(userEmail, userName, courseTitle, amount) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Payment Receipt: ${courseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d97706;">Payment Successful</h1>
          <p>Hello ${userName},</p>
          <p>Thank you for purchasing <strong>${courseTitle}</strong>.</p>
          <p>Amount Paid: ₹ ${amount}.00</p>
          <p>You can now access the course from your dashboard.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
}

export async function sendCompletionEmail(userEmail, userName, courseTitle) {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Course Completed: ${courseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d97706;">Congratulations!</h1>
          <p>Hello ${userName},</p>
          <p>You have successfully completed <strong>${courseTitle}</strong>.</p>
          <p>You can now download your official certificate from your dashboard.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
}