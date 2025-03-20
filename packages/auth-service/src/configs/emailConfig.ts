export const emailConfig = {
  appName: 'AuctiOn',
  baseUrl: process.env.APP_BASE_URL || 'http://192.168.1.120:5173',
  // Add other email-related configuration here
  from: process.env.EMAIL_FROM || 'noreply@auction.com',
  // You can add SMTP settings here if needed
}
