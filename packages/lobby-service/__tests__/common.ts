import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { LobbyModel } from '../src/models/LobbyModel';

export const localMongoConnection =
  async function(): Promise<MongoMemoryServer> {
        const mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()

        await mongoose.connect(uri, { dbName: 'test' })
        await LobbyModel.syncIndexes()
        return mongoServer
    }

export const closeLocalMongoConnection = async function(
  mongoServer: MongoMemoryServer,
) {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
}
