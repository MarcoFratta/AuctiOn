import app from './App'
import { config } from './configs/config'
import { connectMongo } from '@auction/common/mongo'

const port = config.port

connectMongo(config.dbUri)
  .then(() => {
    app.listen(port, () => {
      console.log('Server is running on port 3000')
    })
  })
  .catch(error => {
    console.error('Failed to start server due to database connection error:', error)
  })
