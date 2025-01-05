import app from './App';
import { config } from './configs/config';
import { connectToDatabase } from './utils/MongoDB';
import logger from './utils/Logger';

const port = config.port;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      logger.info('Server is running on port ' + port);
    });
  })
  .catch((error) => {
    logger.error(
      'Failed to start server due to database connection error:',
      error,
    );
  });
