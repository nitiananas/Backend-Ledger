const nodemailer = require("nodemailer");
require("dotenv").config();

const emailConfig = {
  user: process.env.EMAIL_USER,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN,
};

const hasEmailConfig = Boolean(
  emailConfig.user &&
  emailConfig.clientId &&
  emailConfig.clientSecret &&
  emailConfig.refreshToken,
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: emailConfig.user,
    clientId: emailConfig.clientId,
    clientSecret: emailConfig.clientSecret,
    refreshToken: emailConfig.refreshToken,
  },
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  if (!hasEmailConfig) {
    console.warn(
      "Email sending skipped because the SMTP OAuth configuration is incomplete.",
    );
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${emailConfig.user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger";
  const text = `Hello ${name},\n\nThank you for registration at Backend Ledger.
    We're excited to have you on board!\n\nBest regards,\n The Baclend Ledger Team`;
  const html = `<p>Hello${name}.</p><p>Thank you for registering at Backend Ledger.
    We're excited to have you on board!</p><p>Best regards,<br> The Backend Ledger Team</p>`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount,toAccount) {
    const subject = "Transaction Notification";
    const text = `Hello ${name},\n\nA transaction of amount ${amount} has been made to account ${toAccount}.\n\nBest regards,\n The Backend Ledger Team`;
    const html = `<p>Hello ${name}.</p><p>A transaction of amount ${amount} has been made to account ${toAccount}.</p><p>Best regards,<br> The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount,toAccount) {
    const subject = "Transaction Failure Notification";
    const text = `Hello ${name},\n\nA transaction of amount ${amount} to account ${toAccount} has failed.\n\nBest regards,\n The Backend Ledger Team`;
    const html = `<p>Hello ${name}.</p><p>A transaction of amount ${amount} to account ${toAccount} has failed.</p><p>Best regards,<br> The Backend Ledger Team</p>`;
    await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
