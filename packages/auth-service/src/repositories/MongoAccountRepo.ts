// auth-service/src/repositories/MongoAccountRepo.ts
import { AccountModel, IAccount } from '../models/MongoAccount';
import { AccountRepository } from './AccountRepository';
import { Error } from 'mongoose';
import { Account } from '../schemas/AuthSchema';
import { ValidationError } from '../utils/Validator';
import logger from '../utils/Logger';

export class MongoAccountRepo implements AccountRepository {
  // Find an account by ID
  async findById(id: string): Promise<Account | null> {
    const acc = (await AccountModel.findById(id).lean()) as IAccount | null;
    return acc ? this.toAccount(acc) : null;
  }

  // Create a new account
  async create(userData: Omit<Account, 'id'>): Promise<Account> {
    try {
      logger.info(`Mongo creating account`);
      const createdAccount = await AccountModel.create(userData);
      return this.toAccount(createdAccount.toObject());
    } catch (error) {
      if (error instanceof Error.ValidationError) {
        throw new ValidationError(error.message);
      } else {
        throw error;
      }
    }
  }

  // Update an account by ID
  async update(id: string, updateData: Partial<Account>): Promise<Account | null> {
    const updatedAccount = await AccountModel.findByIdAndUpdate(id, updateData, { new: true });
    const plainObject = updatedAccount?.toObject();
    return plainObject ? this.toAccount(plainObject) : null;
  }

  // Delete an account by ID
  async delete(id: string): Promise<boolean> {
    const result = await AccountModel.findByIdAndDelete(id);
    return result !== null; // Return true if an account was deleted
  }

  private toAccount = (acc: IAccount): Account => {
    return { id: acc._id.toString(), pHash: acc.pHash };
  };
}
