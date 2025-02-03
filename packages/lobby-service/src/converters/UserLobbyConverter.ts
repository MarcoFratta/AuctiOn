import { validateSchema } from '@auction/common/validation'
import { UserLobby, userLobbySchema } from '../schemas/UserLobby'
import { Converter } from './Converter'
import { IUserLobby } from '../models/UserLobbyModel'

export const toUserLobby: Converter<IUserLobby, UserLobby> = {
  convert(userLobby: IUserLobby): UserLobby {
    return validateSchema(userLobbySchema, userLobby)
  },
}
