const nodemailer = require("nodemailer");

const sendResetMail = async (email, resetToken, type) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const mailOptions = {
      from: `WWD <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 8px rgba(0,0,0,0.1);">
        <tr>
          <td style="background-color: #000000; color: #ffffff; text-align: center; padding: 25px; font-size: 22px; font-weight: bold;">
            Password Reset Request
          </td>
        </tr>
        <tr>
          <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.5;">
            <p>Hello,</p>
            <p>You requested a password reset. Click the button below to reset your password. The link is valid for <strong>10 minutes</strong>.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_API_LINK}/${type}/update-password/${resetToken}" target="_blank"
                 style="background-color: #000000; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                 Reset Password
              </a>
            </p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thanks,<br>WWD Team</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f9f9f9; color: #555555; text-align: center; padding: 20px; font-size: 12px;">
            © ${new Date().getFullYear()} WWD. All rights reserved.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Reset email sent successfully");
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Could not send reset email");
  }
};

module.exports = sendResetMail;
