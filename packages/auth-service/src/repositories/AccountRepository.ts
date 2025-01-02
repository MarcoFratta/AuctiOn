import { Account } from '../schemas/AuthSchema';

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;

  create(userData: Omit<Account, 'id'>): Promise<Account>;

  update(id: string, updateData: Partial<Account>): Promise<Account | null>;

  delete(id: string): Promise<boolean>;
}
