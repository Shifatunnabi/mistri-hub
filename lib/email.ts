import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

  const mailOptions = {
    from: `"MistriHub" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset Request - MistriHub",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f5f1e8;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1a3a3a;
              margin: 0;
            }
            .content {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background-color: #1a3a3a;
              color: white !important;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-top: 30px;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 MistriHub</h1>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your MistriHub account.</p>
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 15 minutes.
              </div>
              
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>For security reasons, if you continue to receive these emails, please contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>© 2025 MistriHub. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request - MistriHub
      
      Hello,
      
      We received a request to reset your password for your MistriHub account.
      
      Please click on the following link to reset your password:
      ${resetLink}
      
      This link will expire in 15 minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      © 2025 MistriHub. All rights reserved.
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Password reset email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Error sending email:", error)
    throw new Error("Failed to send password reset email")
  }
}

export async function sendHelperApprovalEmail(email: string, name: string, approved: boolean) {
  const subject = approved ? "Helper Account Approved - MistriHub" : "Helper Account Status - MistriHub"

  const mailOptions = {
    from: `"MistriHub" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html: approved
      ? `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f5f1e8; border-radius: 10px; padding: 30px;">
            <h1 style="color: #1a3a3a; text-align: center;">🎉 Congratulations!</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>Hello ${name},</h2>
              <p>Great news! Your Helper account has been approved by our admin team.</p>
              <p>You can now log in and start accepting jobs on MistriHub.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXTAUTH_URL}/login" style="display: inline-block; background-color: #1a3a3a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Login Now
                </a>
              </div>
              <p>Welcome to the MistriHub community!</p>
            </div>
          </div>
        </body>
      </html>
    `
      : `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f5f1e8; border-radius: 10px; padding: 30px;">
            <h1 style="color: #1a3a3a; text-align: center;">Application Update</h1>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>Hello ${name},</h2>
              <p>Thank you for your interest in becoming a Helper on MistriHub.</p>
              <p>Unfortunately, we are unable to approve your account at this time.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("✅ Helper approval email sent:", info.messageId)
    return { success: true }
  } catch (error) {
    console.error("❌ Error sending email:", error)
    // Don't throw error, just log it
    return { success: false }
  }
}
