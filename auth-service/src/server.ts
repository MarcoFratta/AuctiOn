import app from "./App";
import {config} from "./configs/config";
import logger from "./utils/Logger";

const port = config.port;
app.listen(port, () => {
    logger.info(`Auth service running on port ${port}`);
    logger.info(`Swagger docs available at http://localhost:${port}/docs`);
    logger.info(`Connected to user service at ${config.userServiceUrl}`);

});
