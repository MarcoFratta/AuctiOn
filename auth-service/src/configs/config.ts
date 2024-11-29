import * as dotenv from 'dotenv';

dotenv.config({path: '../../.env'});

export const config = {
    port: process.env.PORT || 3000,
    userServiceUrl: process.env.USER_SERVICE_URI || "http://test-url:3001",
    jwtSecret: process.env.JWT_SECRET || "test-secret"
};