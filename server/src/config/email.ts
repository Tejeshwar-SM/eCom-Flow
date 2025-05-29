export const emailConfig = {
  smtp: {
    host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.MAIL_PORT || '2525'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  },
  from: process.env.MAIL_FROM || 'noreply@ecommerce.com',
  templates: {
    orderSuccess: {
      subject: 'Order Confirmation - {{orderNumber}}',
      templatePath: 'templates/orderSuccess.html'
    },
    orderFailure: {
      subject: 'Order Payment Failed - {{orderNumber}}',
      templatePath: 'templates/orderFailure.html'
    }
  }
};

export const getEmailTemplate = (templateName: string, variables: Record<string, any>): string => {
  // Simple template variable replacement
  let template = emailTemplates[templateName] || '';
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, variables[key]);
  });
  
  return template;
};

// Email templates as strings (in a real app, these would be loaded from files)
const emailTemplates: Record<string, string> = {
  orderSuccess: `
    <h1>Order Confirmation</h1>
    <p>Thank you for your order {{orderNumber}}!</p>
    <p>Order Total: {{total}}</p>
  `,
  orderFailure: `
    <h1>Payment Failed</h1>
    <p>Unfortunately, payment for order {{orderNumber}} could not be processed.</p>
    <p>Reason: {{reason}}</p>
  `
};
