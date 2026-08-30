const { BrevoClient } = require("@getbrevo/brevo");

const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_EMAIL_FROM;
const fromName = process.env.BREVO_EMAIL_NAME;

if (!apiKey) {
  throw new Error("BREVO_API_KEY is not configured.");
}

if (!fromEmail) {
  throw new Error("BREVO_EMAIL_FROM is not configured.");
}

if (!fromName) {
  throw new Error("BREVO_EMAIL_NAME is not configured.");
}

const brevo = new BrevoClient({
  apiKey,
  timeoutInSeconds: 30,
  maxRetries: 2,
});

const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
}) => {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  if (!subject) {
    throw new Error("Email subject is required.");
  }

  if (!htmlContent && !textContent) {
    throw new Error("Email content is required.");
  }

  return brevo.transactionalEmails.sendTransacEmail({
    sender: {
      email: fromEmail,
      name: fromName,
    },
    to: [
      {
        email: to,
      },
    ],
    subject,
    htmlContent,
    textContent,
  });
};

const sendOTPEmail = async ({
  to,
  otp,
  expiresInMinutes = 5,
}) => {
  if (!to) {
    throw new Error("OTP recipient email is required.");
  }

  if (!otp || !/^\d{6}$/.test(String(otp))) {
    throw new Error("A valid 6-digit OTP is required.");
  }

  const subject = "Your OJDV Education verification code";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2>OJDV Education</h2>

      <p>Your verification code is:</p>

      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
        ${otp}
      </div>

      <p>This code will expire in ${expiresInMinutes} minutes.</p>

      <p>If you did not request this code, you can safely ignore this email.</p>

      <p>Regards,<br>OJDV Education</p>
    </div>
  `;

  const textContent =
    `OJDV Education\n\n` +
    `Your verification code is: ${otp}\n\n` +
    `This code will expire in ${expiresInMinutes} minutes.\n\n` +
    `If you did not request this code, you can safely ignore this email.\n\n` +
    `Regards,\nOJDV Education`;

  return sendEmail({
    to,
    subject,
    htmlContent,
    textContent,
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
};
