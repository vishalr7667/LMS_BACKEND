const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw - email failure shouldn't break the flow
  }
};

// Email templates
const welcomeEmail = (name) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 40px; text-align: center; }
    .header h1 { color: #FFD700; margin: 0; font-size: 28px; }
    .header p { color: #8B949E; margin-top: 8px; }
    .body { padding: 40px; }
    .body h2 { color: #1a1a2e; }
    .body p { color: #555; line-height: 1.6; }
    .btn { display: inline-block; background: #FFD700; color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 VFXVault Education</h1>
      <p>Welcome to the Future of Learning</p>
    </div>
    <div class="body">
      <h2>Hi ${name}! 👋</h2>
      <p>Welcome to <strong>VFXVault Education</strong>! We're thrilled to have you on board.</p>
      <p>Start exploring our courses and learn at your own pace. Whether you're into game development, computer science, or VFX — we've got something for you.</p>
      <a href="${process.env.CLIENT_URL}/courses" class="btn">Browse Courses</a>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VFXVault Education. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const passwordResetEmail = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 40px; text-align: center; }
    .header h1 { color: #FFD700; margin: 0; font-size: 28px; }
    .body { padding: 40px; }
    .body p { color: #555; line-height: 1.6; }
    .btn { display: inline-block; background: #FFD700; color: #1a1a2e; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
    </div>
    <div class="body">
      <p>Hi ${name},</p>
      <p>You requested a password reset for your VFXVault Education account. Click the button below to reset your password:</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="margin-top: 24px; font-size: 13px; color: #999;">This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} VFXVault Education. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, welcomeEmail, passwordResetEmail };
