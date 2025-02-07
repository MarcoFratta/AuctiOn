import { Account } from '../schemas/AuthSchema'

export interface AccountRepository {
  findById(id: Account['id']): Promise<Account | null>
  create(userData: Omit<Account, 'id'>): Promise<Account>

  update(id: Account['id'], updateData: Partial<Account>): Promise<Account | null>

  delete(id: Account['id']): Promise<boolean>
}
