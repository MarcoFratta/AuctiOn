import express from 'express';
import request from 'supertest';
import { validateRequestBody } from '../src/middlewares/ValidationMiddleware';
import {GenericErrorMiddleware, UserErrorMiddleware} from '../src/middlewares/ErrorsMiddleware';
import { UserSchema } from '../src/schemas/User';
import { UserController } from '../src/controllers/UserController';

jest.mock('../src/controllers/UserController'); // Mock the controller to isolate middleware

describe('User Routes - Middleware Testing', () => {
    let app: express.Application;
    let c: UserController = new UserController({} as any);

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Mock routes
        app.post('/users', validateRequestBody(UserSchema), c.createUser,
            UserErrorMiddleware, GenericErrorMiddleware // Error-handling middleware
        );

        app.put('/users/:id', validateRequestBody(UserSchema), c.updateUser,
            UserErrorMiddleware, GenericErrorMiddleware
        );
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('POST /users - Validation Middleware', () => {
        it('should return 400 for invalid input (missing fields)', async () => {
            const invalidUser = { name: 'John Doe' }; // Missing email

            const response = await request(app).post('/users').send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should return 400 for invalid input (wrong email format)', async () => {
            const invalidUser = { name: 'John Doe', email: 'invalid-email' };

            const response = await request(app).post('/users').send(invalidUser);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid body schema');
        });

        it('should pass validation and call the c for valid input', async () => {
            const validUser = { name: 'John Doe', email: 'john@example.com' };
            const controllerMock = jest.spyOn(UserController.prototype, 'createUser');
            controllerMock.mockImplementation(async (_req,res) => {res.status(200).send()})
            const response = await request(app).post('/users').send(validUser);

            expect(response.status).toBe(200); // Assume the c is mocked to return 200
            expect(controllerMock).toHaveBeenCalled();
        });
    });

    describe('PUT /users/:id - Validation Middleware', () => {
        it('should return 400 for invalid input (missing fields)', async () => {
            const invalidUpdate = { name: '' }; // Empty name is invalid

            const response = await request(app).put('/users/1').send(invalidUpdate);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should return 400 for invalid input (wrong email format)', async () => {
            const invalidUpdate = { name: 'John Doe', email: 'invalid-email' };

            const response = await request(app).put('/users/1').send(invalidUpdate);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', "Invalid body schema");
        });

        it('should pass validation and call the c for valid input', async () => {
            const validUpdate = { name: 'John Doe', email: 'john@example.com' };
            const controllerMock = jest.spyOn(UserController.prototype, 'updateUser');
            controllerMock.mockImplementation(async (req,res,next) => {
                res.status(200).send()
            })
            const response = await request(app).put('/users/1').send(validUpdate);

            expect(response.status).toBe(200); // Assume the c is mocked to return 200
            expect(controllerMock).toHaveBeenCalled();
        });
    });

    describe('Error Middleware', () => {
        it('should return a 500 error if an exception is thrown', async () => {
            const controllerMock = jest.spyOn(UserController.prototype, 'createUser');
            controllerMock.mockImplementationOnce(async (req, res, next) => {
                next(new Error('Unexpected error'));
            });

            const validUser = { name: 'John Doe', email: 'john@example.com' };

            const response = await request(app).post('/users').send(validUser);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'An unexpected error occurred.');
        });
    });
});
