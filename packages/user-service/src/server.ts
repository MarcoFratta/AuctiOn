import app from './App';
import { config } from './configs/config';
import { connectToDatabase } from './utils/MongoDB';

const port = config.port;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to database connection error:', error);
  });
