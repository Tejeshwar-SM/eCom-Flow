import nodemailer from 'nodemailer';

export const createMailtrapTransporter = () => {
  return nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER || 'your_mailtrap_user',
      pass: process.env.MAILTRAP_PASS || 'your_mailtrap_password'
    }
  });
};

export const mailtrapConfig = {
  sender: process.env.MAILTRAP_SENDER_EMAIL || 'hello@demomailtrap.com',
  testRecipient: 'test@example.com' // For testing purposes
};
