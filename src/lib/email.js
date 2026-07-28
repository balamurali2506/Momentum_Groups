import nodemailer from 'nodemailer';

// 1. Create the Gmail Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // Removes spaces if you added them
  },
});

// Helper function to send emails
async function sendEmail(to, subject, htmlContent) {
  try {
    await transporter.sendMail({
      from: `"Momentum Learning" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });
    console.log(`Email sent successfully to: ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
}

// 2. Payment Receipt Email
export async function sendReceiptEmail(userEmail, userName, courseTitle, amount) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f3e7; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #d97706 0%, #92400e 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💳 Payment Successful</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1c1917; margin-top: 0;">Thank you for your purchase!</h2>
        <p style="color: #44403c; font-size: 16px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #44403c; font-size: 16px; line-height: 1.6;">Thank you for purchasing <strong>${courseTitle}</strong>. Your payment has been successfully processed and you now have lifetime access to this course.</p>
        <div style="margin: 30px 0; padding: 20px; background: #f9f3e7; border-left: 4px solid #d97706; border-radius: 6px;">
          <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #78716c; font-size: 14px;">Course:</td><td style="padding: 8px 0; color: #1c1917; font-weight: bold; font-size: 14px; text-align: right;">${courseTitle}</td></tr>
            <tr><td style="padding: 8px 0; color: #78716c; font-size: 14px;">Amount Paid:</td><td style="padding: 8px 0; color: #1c1917; font-weight: bold; font-size: 14px; text-align: right;">₹${amount}.00</td></tr>
            <tr><td style="padding: 8px 0; color: #78716c; font-size: 14px;">Access:</td><td style="padding: 8px 0; color: #1c1917; font-weight: bold; font-size: 14px; text-align: right;">Lifetime</td></tr>
          </table>
        </div>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #d97706 0%, #92400e 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
        </div>
      </div>
    </div>
  `;
  await sendEmail(userEmail, `Payment Receipt: ${courseTitle}`, html);
}

// 3. Course Completion Email
export async function sendCompletionEmail(userEmail, userName, courseTitle) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f3e7; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Congratulations!</h1>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1c1917; margin-top: 0;">You did it!</h2>
        <p style="color: #44403c; font-size: 16px; line-height: 1.6;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #44403c; font-size: 16px; line-height: 1.6;">Congratulations on successfully completing <strong>${courseTitle}</strong>! We're proud of your achievement.</p>
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
          <h3 style="margin: 0; color: #065f46; font-size: 20px;">Certificate of Completion</h3>
          <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">Your certificate is now available</p>
        </div>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Download Certificate</a>
        </div>
      </div>
    </div>
  `;
  await sendEmail(userEmail, ` Course Completed: ${courseTitle}`, html);
}