const nodemailer = require("nodemailer");

const sendExamMail = async (email, { name, date, examType, totalMarks }) => {
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
            subject: `📝 New Exam Scheduled: ${name}`,
            html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; padding: 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <tr>
          <td style="background-color: #000000; color: #ffffff; text-align: center; padding: 25px; font-size: 24px; font-weight: bold;">
            📢 Examination Notice
          </td>
        </tr>
        <tr>
          <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.6;">
            <h2 style="color:#000;">${name}</h2>
            <p><strong>Exam Type:</strong> ${examType.toUpperCase()} Week</p>
            <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
            <p><strong>Total Marks:</strong> ${totalMarks}</p>
            <p>Please prepare accordingly. Wishing you success in your upcoming exam!</p>
            <p>Best regards,<br><strong>WWD Team</strong></p>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f9f9f9; color:#777; text-align:center; padding:15px; font-size:12px;">
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
        console.log(`Exam email sent to ${email}`);
    } catch (error) {
        console.error("Error sending exam email:", error);
    }
};

module.exports = sendExamMail;
