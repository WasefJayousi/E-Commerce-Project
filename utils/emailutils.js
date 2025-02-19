const nodemailer = require("nodemailer");

// Function to send an email
const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail", // Example: Gmail SMTP (use your own provider)
            auth: {
                user: process.env.GMAIL_USER, // Set in .env
                pass: process.env.GMAIL_PASS, // Set in .env
            },
        });

        const mailOptions = {
            from: process.env.GMAIL_USER, 
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
module.exports = { sendEmail };
