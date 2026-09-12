import nodemailer from "nodemailer";

export async function sendVerificationEmail(email, code) {
  const transport = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  const receiver = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "SynapseCode | Verification Code",
    headers: {
      "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}>`,
    },
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hello, Coder!</h2>
          <p>Your verification code for SynapseCode is:</p>
          <h3 style="color: green;">${code}</h3>
          <p>Please enter this code on the website to verify your email.</p>
          <p>Thank you!</p>
          <p style="font-size: 12px; color: gray;">
            Stealthify | Your Company Address | <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a>
          </p>
          <p style="font-size: 12px; color: gray;">If you didn't request this, please ignore this email.</p>
        </div>
      </body>
    </html>
    `,
  };

  const result = await transport.sendMail(receiver);
  if (result.rejected.length > 0) {
    return { success: false, message: "Verification email not sent!" };
  }
  return { success: true, message: "Verification email sent!" };
}
