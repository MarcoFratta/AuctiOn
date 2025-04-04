import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserRepository } from '../../src/repositories/UserRepository'
import { MongooseUserRepository } from '../../src/repositories/MongoUserRepo'
import { reverseUserConverter, userConverter } from '../../src/utils/Converters'
import { UserModel } from '../../src/models/MongoUser'
import { EmailAlreadyExistsError } from '../../src/errors/UserErrors' // Assume User schema is exported
jest.setTimeout(60000)
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

    it('should return null when the user is not found', async () => {
        const user = await repository.findById('60c72b2f9b1e8b5a5c8b4567');
        expect(user).toBeNull();
    });

    it('should throw an error when trying to create a user with a duplicate email', async () => {
        const userInput = {id: "1", name: 'John Doe', email: 'john@example.com'};
        // Create the first user
        await repository.create(userInput);
        // Try creating a second user with the same email
        const userInput2 = {id: "2", name: 'Jane Doe', email: 'john@example.com'};
        await expect(repository.create(userInput2)).rejects.toThrow(
            new EmailAlreadyExistsError(userInput.email));
    });

    it('should throw an error if the database connection fails', async () => {
        // Simulate a database disconnection
        await mongoose.connection.close();

        const userInput = {id: "1", name: 'Jane Doe', email: 'jane@example.com'};

        await expect(repository.create(userInput)).rejects.toThrow(
            'Client must be connected before running operations'// Connection error
        );

        // Reconnect for subsequent tests
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, {dbName: 'test'});
    });
});
