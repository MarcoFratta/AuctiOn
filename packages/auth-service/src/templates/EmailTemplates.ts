import { config } from '../configs/config'

interface EmailTemplateOptions {
  appName: string
  baseUrl: string
}

export class EmailTemplates {
  private readonly appName: string
  private readonly baseUrl: string

  constructor(options: EmailTemplateOptions) {
    this.appName = options.appName
    this.baseUrl = options.baseUrl
  }

  /**
   * Welcome email template for new registrations
   */
  getWelcomeEmailTemplate(): string {
    const content = `
      <h2>Welcome to ${this.appName}!</h2>
      <p>Thank you for registering with us. We're excited to have you on board.</p>
      <p>You can now start exploring our platform and participate in auctions.</p>
      <p>
        <a href="${this.baseUrl}" class="btn">Get Started</a>
      </p>
      <p>If you have any questions, feel free to contact our support team.</p>
    `

    return this.getEmailLayout(content)
  }

  /**
   * Password reset email template
   */
  getPasswordResetTemplate(token: string): string {
    const resetLink = `${this.baseUrl}/reset/${token}`

    const content = `
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4a6ee0; color: white !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; text-align: center;">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 14px;">
        <a href="${resetLink}">${resetLink}</a>
      </p>
      <p>This link will expire in ${config.resetTokenExpireMinutes} minutes.</p>
    `

    return this.getEmailLayout(content)
  }

  /**
   * Common email layout used for all emails
   */
  private getEmailLayout(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${this.appName}</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .email-header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid #eee;
              margin-bottom: 20px;
            }
            .email-header h1 {
              color: #4a6ee0;
              margin: 0;
              font-size: 28px;
            }
            .email-content {
              padding: 20px 0;
            }
            .email-footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #eee;
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
            .btn {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4a6ee0;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin: 20px 0;
              text-align: center;
            }
            .btn:hover {
              background-color: #3a5ecc;
            }
            .btn a {
              color: white;
              text-decoration: none;
            }
            @media (prefers-color-scheme: light) {
              .btn {
                background-color: #4a6ee0;
                color: #ffffff;
              }
            }
            @media (prefers-color-scheme: dark) {
              .btn {
                background-color: #4a6ee0;
                color: #ffffff;
              }
            }
            p {
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>${this.appName}</h1>
            </div>
            <div class="email-content">
              ${content}
            </div>
            <div class="email-footer">
              &copy; ${new Date().getFullYear()} ${this.appName}. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `
  }
}
