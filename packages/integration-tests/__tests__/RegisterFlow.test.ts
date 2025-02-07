import request from 'supertest'
import { connectToServer } from './Connection'

const API_GATEWAY_URL = 'http://localhost:8080'


beforeAll(async () => {
  await connectToServer(API_GATEWAY_URL)
})

describe('E2E Tests', () => {
  it('should register a user successfully', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      })

    console.log(res.body)
    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('test@example.com')
  })
  it('should login a user successfully', async () => {
    const res = await request(API_GATEWAY_URL)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123',
      })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('token')
  })
})