import request from 'supertest'
import { connectToServer } from './Connection'
import logger from '@auction/common/logger' // Import logger

const API_GATEWAY_URL = 'http://localhost:8080'

async function retrieveResetTokenForUser(email: string): Promise<string | null> {
  logger.info(`--- retrieveResetTokenForUser called for ${email} - Using MailHog logic ---`)
  try {
    // Add a small delay to ensure email is processed by MailHog
    await new Promise(resolve => setTimeout(resolve, 500))

    const mailhogRes = await fetch('http://localhost:8025/api/v2/search?kind=to&query=' + encodeURIComponent(email))
    if (!mailhogRes.ok) {
      logger.error(`MailHog API request failed with status ${mailhogRes.status}`)
      return null
    }
    const emails = await mailhogRes.json()

    if (emails.count > 0) {
      // Sort emails by received date descending to get the latest one
      emails.items.sort((a: any, b: any) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
      const latestEmail = emails.items[0]
      const body = latestEmail.Content.Body
      logger.info(`Latest email body: ${JSON.stringify(body)}`)


      const match = body.match(/\/reset\/([^"]+)/)
      // --- End Simpler Regex ---

      if (match && match[1]) {
        const token = match[1] // Group 1 captures the token
        const clearToken = token.replace(/=/g, '').replace(/[\r\n]+/g, '')
        logger.info(`Retrieved token using simple pattern for ${email} via MailHog: ${clearToken}`)
        // Optional: Add a basic check for JWT structure (two dots)
        if (clearToken.split('.').length === 3) {
          return clearToken
        } else {
          logger.warn(`Captured token "${clearToken}" does not look like a JWT (missing dots). Check email format or regex.`)
          // Still return it for now, maybe the reset endpoint handles variations
          return clearToken
        }
      } else {
        logger.error(`Could not find token using pattern '/reset/([^"]+)' in MailHog email body for ${email}`)
        // Log the body for debugging if the match fails
        console.log('Email Body for failed match:', body)
      }
    } else {
      logger.error(`No emails found in MailHog for ${email}`)
    }
  } catch (error) {
    logger.error(`Error fetching or processing email from MailHog for ${email}: ${error}`)
  }

  // Return null if token wasn't found
  return null
}

// --- End Placeholder ---


beforeAll(async () => {
  await connectToServer(API_GATEWAY_URL)
})

// Increase timeout for tests involving external interaction or waits
jest.setTimeout(30000)

describe('Auth Flow Tests', () => {
  const testEmail = `test-${Date.now()}@example.com` // Use unique email per run
  const initialPassword = 'Password123'
  const newPassword = 'NewPassword456'

  it('should register a user successfully', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/register')
      .send({
        email: testEmail,
        password: initialPassword,
        name: 'Reset Test User',
      })

    // console.log(res.body) // Keep for debugging if needed
    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe(testEmail)
    logger.info(`Registered user ${testEmail} successfully.`)
  })

  it('should login the user successfully with initial password', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: initialPassword,
      })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('token')
    logger.info(`Logged in user ${testEmail} successfully with initial password.`)
  })

  it('should initiate password reset successfully', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/forgot/' + testEmail)
      .send()

    // Expect success, even if email sending fails, the request might be accepted
    expect(res.status).toBe(200) // Or 204 No Content, depending on your API design
    logger.info(`Initiated password reset for ${testEmail}.`)

    // Add a small delay to allow email generation/sending/capture
    // Increased slightly to be safer
    await new Promise(resolve => setTimeout(resolve, 2500))
  })

  it('should reset the password successfully using the token', async () => {
    logger.info(`Attempting to retrieve reset token for ${testEmail}...`)
    const resetToken = await retrieveResetTokenForUser(testEmail)

    expect(resetToken).toBeTruthy() // Checks for null, undefined, empty string
    if (!resetToken) {
      throw new Error(`Failed to retrieve password reset token for ${testEmail}. Check retrieveResetTokenForUser implementation and MailHog/Mock setup.`)
    }
    logger.info(`Retrieved token: ${resetToken}. Attempting password reset...`)


    const res = await request(API_GATEWAY_URL)
      .post('/auth/reset')
      .send({
        token: resetToken,
        password: newPassword,
      })

    expect(res.status).toBe(200)
    logger.info(`Password for ${testEmail} reset successfully.`)
  })

  it('should fail to login with the old password', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: initialPassword, // Use the OLD password
      })
    expect(res.status).toBe(400) // Unauthorized or similar error
    logger.info(`Verified login failure with old password for ${testEmail}.`)
  })

  it('should login the user successfully with the new password', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/login')
      .send({
        email: testEmail,
        password: newPassword, // Use the NEW password
      })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('token')
    logger.info(`Logged in user ${testEmail} successfully with new password.`)
  })

  // Add tests for invalid/expired tokens if desired
  it('should fail to reset password with an invalid token', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/reset')
      .send({
        token: 'invalid-or-expired-token',
        password: 'SomeOtherPassword789',
      })

    expect(res.status).toBe(400)
    logger.info(`Verified password reset failure with invalid token.`)
  })

})