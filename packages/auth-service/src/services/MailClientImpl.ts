import { MailClient } from './MailClient'
import { Transporter } from 'nodemailer'
import logger from '@auction/common/logger'

export class MailClientImpl implements MailClient {
  constructor(private readonly client: Transporter) {}

  async sendRegisterMail(email: string): Promise<void> {
    const mailOptions = {
      from: `AuctiOn <${this.client.options.from}>`,
      to: email,
      subject: 'Welcome to AuctiOn',
      html: '<p>Thank you for registering with AuctiOn</p>',
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
      from: `AuctiOn <${this.client.options.from}>`,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="http://localhost/reset/${token}">here</a>
              to reset your password</p>`,
    }
    try {
      const info = await this.client.sendMail(mailOptions)
      logger.info(`Email sent: ${info.response}`)
    } catch (error) {
      logger.error(`Error sending email: ${error}`)
    }
  }
}
