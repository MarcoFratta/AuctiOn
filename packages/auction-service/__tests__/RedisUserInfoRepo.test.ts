import redisMock from 'ioredis-mock'
import { RedisUserInfoRepository } from '../src/repositories/RedisUserInfoRepository'
import Redis from 'ioredis'

describe('RedisUserInfoRepository', () => {
  let redis: Redis
  let repo: RedisUserInfoRepository

  beforeEach(() => {
    redis = new redisMock()
    repo = new RedisUserInfoRepository(redis)
  })

  it('should add and get a user', async () => {
    await repo.addUser('user1', { username: 'Alice', status: 'ready' })
    const user = await repo.getUser('user1')
    expect(user).toEqual({ username: 'Alice', status: 'ready' })
  })

  it('should update a user', async () => {
    await repo.addUser('user2', { username: 'Bob', status: 'ready' })
    await repo.updateUser('user2', { status: 'ready' })
    const user = await repo.getUser('user2')
    expect(user).toEqual({ username: 'Bob', status: 'ready' })
  })

  it('should remove a user', async () => {
    await repo.addUser('user3', { username: 'Charlie', status: 'ready' })
    await repo.removeUser('user3')
    const user = await repo.getUser('user3')
    expect(user).toBeUndefined()
  })

  it('should return undefined for non-existent user', async () => {
    const user = await repo.getUser('nope')
    expect(user).toBeUndefined()
  })
})