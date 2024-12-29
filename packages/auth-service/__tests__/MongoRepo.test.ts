// auth-service/tests/MongoRepo.test.ts
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { AccountRepository } from '../src/repositories/AccountRepository'
import { MongoAccountRepo } from '../src/repositories/MongoAccountRepo'
import { AccountModel } from '../src/models/MongoAccount'
import { ValidationError } from '../src/utils/Validator'

describe('AccountRepository with MongoMemoryServer', () => {
    let mongoServer: MongoMemoryServer
    let repository: AccountRepository

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()

        await mongoose.connect(uri, { dbName: 'test' })
        await AccountModel.syncIndexes()

        repository = new MongoAccountRepo()
    })

    afterAll(async () => {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await AccountModel.deleteMany() // Clear database before each test
    })

    it('should create and retrieve an account', async () => {
        const accountInput = { pHash: 'hashed_password' }
        const createdAccount = await repository.create(accountInput)

        expect(createdAccount.pHash).toBe('hashed_password')
        expect(createdAccount.id).toBeDefined()

        const retrievedAccount = await repository.findById(createdAccount.id)
        expect(retrievedAccount).not.toBeNull()
        expect(retrievedAccount!.pHash).toBe('hashed_password')
    })

    it('should return null when the account is not found', async () => {
        const account = await repository.findById('60c72b2f9b1e8b5a5c8b4567')
        expect(account).toBeNull()
    })

    it('should update an account', async () => {
        const accountInput = { pHash: 'hashed_password' }
        const createdAccount = await repository.create(accountInput)
        const updatedAccount = await repository.update(createdAccount.id, {
            pHash: 'new_hashed_password',
        })
        const retrievedAccount = await repository.findById(createdAccount.id)

        expect(updatedAccount!.pHash).toBe('new_hashed_password')
        expect(retrievedAccount!.pHash).toBe('new_hashed_password')
    })

    it('should delete an account', async () => {
        const accountInput = { pHash: 'hashed_password' }
        const createdAccount = await repository.create(accountInput)

        await repository.delete(createdAccount.id)

        const retrievedAccount = await repository.findById(createdAccount.id)
        expect(retrievedAccount).toBeNull()
    })

    it('should throw a validation error if the account data is invalid', async () => {
        const invalidAccountInput = {} // Missing pHash

        await expect(
            repository.create(invalidAccountInput as any)
        ).rejects.toThrow(ValidationError)
    })
})
