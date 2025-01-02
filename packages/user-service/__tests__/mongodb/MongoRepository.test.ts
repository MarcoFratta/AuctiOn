<<<<<<< HEAD
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserRepository } from '../../src/repositories/UserRepository'
import { MongooseUserRepository } from '../../src/repositories/MongoUserRepo'
import { reverseUserConverter, userConverter } from '../../src/utils/Converters'
import { UserModel } from '../../src/models/MongoUser' // Assume User schema is exported

describe('UserRepository with MongoMemoryServer', () => {
    let mongoServer: MongoMemoryServer
    let repository: UserRepository

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()

        await mongoose.connect(uri, { dbName: 'test' })
        await UserModel.syncIndexes()

        repository = new MongooseUserRepository(
            userConverter,
            reverseUserConverter
        )
    })

    afterAll(async () => {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await UserModel.deleteMany() // Clear database before each test
    })

    it('should create and retrieve a user', async () => {
        const userInput = {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
        }
        const createdUser = await repository.create(userInput)

        expect(createdUser.name).toBe('John Doe')
        expect(createdUser.email).toBe('john@example.com')

        const users = await repository.findAll()
        expect(users).toHaveLength(1)
        expect(users[0].name).toBe('John Doe')
    })

    it('should delete a user', async () => {
        const userInput = {
            id: '1',
            name: 'Jane Doe',
            email: 'jane@example.com',
        }
        const createdUser = await repository.create(userInput)
        console.log(createdUser)

        await repository.delete(createdUser.id!)

        const users = await repository.findAll()
        expect(users).toHaveLength(0)
    })
    it('should update a user', async () => {
        const userInput = {
            id: '1',
            name: 'Jane Doe',
            email: 'jane@example.com',
        }
        const createdUser = await repository.create(userInput)
        const updatedUser = await repository.update(createdUser.id!, {
            name: 'Jonny Doe',
        })
        const retrievedUser = await repository.findById(createdUser.id!)
        expect(updatedUser!.name).toBe('Jonny Doe')
        expect(retrievedUser!.name).toBe('Jonny Doe')
    })
})
=======
import mongoose from 'mongoose';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {UserRepository} from '../../src/repositories/UserRepository';
import {MongooseUserRepository} from "../../src/repositories/MongoUserRepo";
import {reverseUserConverter, userConverter} from "../../src/utils/Converters";
import {UserModel} from "../../src/models/MongoUser"; // Assume User schema is exported

describe('UserRepository with MongoMemoryServer', () => {
    let mongoServer: MongoMemoryServer;
    let repository: UserRepository;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri, {dbName: 'test'});
        await UserModel.syncIndexes();

        repository = new MongooseUserRepository(userConverter, reverseUserConverter);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await UserModel.deleteMany(); // Clear database before each test
    });

    it('should create and retrieve a user', async () => {
        const userInput = {id: "1", name: 'John Doe', email: 'john@example.com'};
        const createdUser = await repository.create(userInput);

        expect(createdUser.name).toBe('John Doe');
        expect(createdUser.email).toBe('john@example.com');

        const users = await repository.findAll();
        expect(users).toHaveLength(1);
        expect(users[0].name).toBe('John Doe');
    });

    it('should delete a user', async () => {
        const userInput = {id: "1", name: 'Jane Doe', email: 'jane@example.com'};
        const createdUser = await repository.create(userInput);
        console.log(createdUser)

        await repository.delete(createdUser.id!);

        const users = await repository.findAll();
        expect(users).toHaveLength(0);
    });
    it('should update a user', async () => {
        const userInput = {id: "1", name: 'Jane Doe', email: 'jane@example.com'}
        const createdUser = await repository.create(userInput);
        const updatedUser = await repository.update(createdUser.id!, {name: 'Jonny Doe'});
        const retrievedUser = await repository.findById(createdUser.id!);
        expect(updatedUser!.name).toBe('Jonny Doe');
        expect(retrievedUser!.name).toBe('Jonny Doe');
    });
});
>>>>>>> c774751 (chore: fix project structure bug)
