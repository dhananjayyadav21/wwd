const nodemailer = require("nodemailer");

const sendNoticeMail = async (email, title, description, link) => {
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
            subject: `New Notice: ${title}`,
            html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0; margin: 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #000000, #333333); color: #ffffff; text-align: center; padding: 30px 20px; font-size: 24px; font-weight: bold; letter-spacing: 1px;">
            📢 Important Notice from WWD
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 35px 40px; color: #333333; font-size: 16px; line-height: 1.7;">
            <h2 style="color: #111111; font-size: 22px; margin-bottom: 15px;">${title}</h2>
            <p style="margin-bottom: 25px;">${description}</p>

            ${link
                    ? `<div style="text-align: center; margin: 40px 0;">
                    <a href="${link}" target="_blank" style="background-color: #000000; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: all 0.3s;">
                      View Full Notice
                    </a>
                  </div>`
                    : ""
                }

            <p style="margin-top: 40px; color: #555555;">Best Regards,<br><strong>WWD Team</strong></p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="border-top: 1px solid #eeeeee;"></td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #fafafa; color: #888888; text-align: center; padding: 20px; font-size: 13px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} <strong>WWD</strong>. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">This is an automated message, please do not reply.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,
        };

        await transporter.sendMail(mailOptions);
        console.log("Notice email sent successfully to:", email);
    } catch (error) {
        console.error("Error sending notice email:", error);
        throw new Error("Could not send notice email");
    }
};

module.exports = sendNoticeMail;
