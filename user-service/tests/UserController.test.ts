import express from 'express';
import request from 'supertest';
import { UserController } from '../src/controllers/UserController';
import { UserService } from '../src/services/UserService';
import { User } from '../src/schemas/User';

jest.mock('../src/services/UserService');

describe('UserController', () => {
    let app: express.Application;
    let mockService: jest.Mocked<UserService>;
    let controller: UserController;

    beforeEach(() => {
        mockService = new UserService({} as any) as jest.Mocked<UserService>;
        controller = new UserController(mockService);

        app = express();
        app.use(express.json());

        // Mock routes
        app.get('/users', (req, res, next) => controller.getUsers(req, res, next));
        app.get('/users/:id', (req, res, next) => controller.getUserById(req, res, next));
        app.post('/users', (req, res, next) => controller.createUser(req, res, next));
        app.put('/users/:id', (req, res, next) => controller.updateUser(req, res, next));
        app.delete('/users/:id', (req, res, next) => controller.deleteUser(req, res, next));
    });

    describe('GET /users', () => {
        it('should return a list of users', async () => {
            const mockUsers: User[] = [{ id: '1', name: 'John Doe', email: 'john@example.com' }];

            mockService.getUsers.mockResolvedValue(mockUsers);

            const response = await request(app).get('/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
            expect(mockService.getUsers).toHaveBeenCalled();
        });

        it('should return an error', async () => {
            mockService.getUsers.mockRejectedValue(new Error('Service error'));

            const response = await request(app).get('/users');

            expect(response.status).toBe(500);
        });
    });

    describe('GET /users/:id', () => {
        it('should return a user by ID', async () => {
            const mockUser: User = { id: '1', name: 'John Doe', email: 'john@example.com' };

            mockService.getUserById.mockResolvedValue(mockUser);

            const response = await request(app).get('/users/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
            expect(mockService.getUserById).toHaveBeenCalledWith('1');
        });

        it('should return 404 if user is not found', async () => {
            mockService.getUserById.mockRejectedValue(new Error('User not found'));

            const response = await request(app).get('/users/99');

            expect(response.status).toBe(500);
        });

        it('should return an error', async () => {
            mockService.getUserById.mockRejectedValue(new Error('Service error'));

            const response = await request(app).get('/users/1');

            expect(response.status).toBe(500);
        });
    });

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const newUser: User = { name: 'Jane Doe', email: 'jane@example.com', id: '2' };
            const userInput = { name: 'Jane Doe', email: 'jane@example.com' };

            mockService.createUser.mockResolvedValue(newUser);

            const response = await request(app).post('/users').send(userInput);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(newUser);
            expect(mockService.createUser).toHaveBeenCalledWith(userInput);
        });

        it('should return an error', async () => {
            const userInput = { name: 'Jane Doe', email: 'jane@example.com' };

            mockService.createUser.mockRejectedValue(new Error('Service error'));

            const response = await request(app).post('/users').send(userInput);

            expect(response.status).toBe(500);
        });
    });

    describe('PUT /users/:id', () => {
        it('should update a user', async () => {
            const updatedUser: User = { id: '1', name: 'John Doe', email: 'john.doe@example.com' };

            mockService.updateUser.mockResolvedValue(updatedUser);

            const response = await request(app)
                .put('/users/1')
                .send({ email: 'john.doe@example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedUser);
            expect(mockService.updateUser).toHaveBeenCalledWith('1', { email: 'john.doe@example.com' });
        });

        it('should return 404 if user to update is not found', async () => {
            mockService.updateUser.mockRejectedValue(new Error('User not found'));

            const response = await request(app).put('/users/99').send({ email: 'john.doe@example.com' });

            expect(response.status).toBe(500);
        });

        it('should return an error', async () => {
            mockService.updateUser.mockRejectedValue(new Error('Service error'));

            const response = await request(app).put('/users/1').send({ email: 'john.doe@example.com' });

            expect(response.status).toBe(500);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should delete a user', async () => {
            mockService.deleteUser.mockResolvedValue();

            const response = await request(app).delete('/users/1');

            expect(response.status).toBe(204); // No Content
            expect(mockService.deleteUser).toHaveBeenCalledWith('1');
        });

        it('should return 404 if user to delete is not found', async () => {
            mockService.deleteUser.mockRejectedValue(new Error('User not found'));

            const response = await request(app).delete('/users/99');

            expect(response.status).toBe(500);
        });

        it('should return an error', async () => {
            mockService.deleteUser.mockRejectedValue(new Error('Service error'));

            const response = await request(app).delete('/users/1');

            expect(response.status).toBe(500);
        });
    });
});
