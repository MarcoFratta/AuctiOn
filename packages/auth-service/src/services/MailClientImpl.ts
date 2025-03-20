import { MailClient } from './MailClient'
import { Transporter } from 'nodemailer'
import logger from '@auction/common/logger'
import { EmailTemplates } from '../templates/EmailTemplates'

export class MailClientImpl implements MailClient {
  private readonly emailTemplates: EmailTemplates

  constructor(
    private readonly client: Transporter,
    private readonly appConfig: { appName: string; baseUrl: string }
  ) {
    this.emailTemplates = new EmailTemplates({
      appName: appConfig.appName,
      baseUrl: appConfig.baseUrl,
    })
  }

  async sendRegisterMail(email: string): Promise<void> {
    const mailOptions = {
      from: `${this.appConfig.appName} <${this.client.options.from}>`,
      to: email,
      subject: `Welcome to ${this.appConfig.appName}`,
      html: this.emailTemplates.getWelcomeEmailTemplate(),
    }

    try {
      const info = await this.client.sendMail(mailOptions)
      logger.info(`Email sent: ${info.response}`)
    } catch (error) {
      logger.error(`Error sending email: ${error}`)
    }
  }

  async sendResetMail(email: string, token: string): Promise<void> {
    const mailOptions = {
      from: `${this.appConfig.appName} <${this.client.options.from}>`,
      to: email,
      subject: 'Reset your password',
      html: this.emailTemplates.getPasswordResetTemplate(token),
    }
    try {
      const info = await this.client.sendMail(mailOptions)
      logger.info(`Email sent: ${info.response}`)
    } catch (error) {
      logger.error(`Error sending email: ${error}`)
    }
  }
}
