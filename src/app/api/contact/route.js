import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Send email to admin (Use your registered Resend email for testing)
    await resend.emails.send({
      from: 'Momentum Contact <onboarding@resend.dev>',
      to: 'balamurali48171@gmail.com', // 🔥 CHANGE THIS TO YOUR REGISTERED RESEND EMAIL
      replyTo: email,
      subject: `New Contact Form Submission: ${subject || 'General Inquiry'}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f3e7; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #d97706 0%, #92400e 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📩 New Contact Submission</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1c1917; margin-top: 0;">Contact Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 12px; background: #f5f5f4; border-radius: 6px; font-weight: bold; color: #44403c; width: 30%;">Name:</td>
                <td style="padding: 12px; background: #fafaf9; border-radius: 6px; color: #1c1917;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #f5f5f4; border-radius: 6px; font-weight: bold; color: #44403c;">Email:</td>
                <td style="padding: 12px; background: #fafaf9; border-radius: 6px; color: #1c1917;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 12px; background: #f5f5f4; border-radius: 6px; font-weight: bold; color: #44403c;">Phone:</td>
                <td style="padding: 12px; background: #fafaf9; border-radius: 6px; color: #1c1917;">${phone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 12px; background: #f5f5f4; border-radius: 6px; font-weight: bold; color: #44403c;">Subject:</td>
                <td style="padding: 12px; background: #fafaf9; border-radius: 6px; color: #1c1917;">${subject || 'N/A'}</td>
              </tr>
            </table>

            <div style="margin: 20px 0; padding: 20px; background: #f9f3e7; border-left: 4px solid #d97706; border-radius: 6px;">
              <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">Message:</h3>
              <p style="margin: 0; color: #44403c; line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e7e5e4; text-align: center; color: #78716c; font-size: 12px;">
              <p>This message was sent from the Momentum Contact Form</p>
              <p style="margin: 5px 0 0 0;">Reply directly to: ${email}</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}