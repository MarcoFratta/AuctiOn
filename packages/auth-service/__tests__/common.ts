import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AccountModel } from '../src/models/MongoAccount';

export const localMongoConnection = async function (): Promise<MongoMemoryServer> {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, { dbName: 'test' });
  await AccountModel.syncIndexes();
  return mongoServer;
};

export const closeLocalMongoConnection = async function (mongoServer: MongoMemoryServer) {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};
