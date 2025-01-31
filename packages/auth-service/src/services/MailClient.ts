export interface MailClient {
  sendResetMail(email: string, token: string): Promise<void>

  sendRegisterMail(email: string): Promise<void>
}
