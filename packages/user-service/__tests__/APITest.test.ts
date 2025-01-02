<<<<<<< HEAD
import express from 'express'
import request from 'supertest'
import { createUserRouter } from '../src/routes/UserRoutes'
import { UserController } from '../src/controllers/UserController'
import { UserService } from '../src/services/UserService' // Assuming the controller depends on a UserService
import { MockUserRepository } from './MockUserRepository'

describe('UserRoutes - Integration Tests', () => {
    let app: express.Application
    let userService: UserService
    let userController: UserController

    beforeEach(() => {
        app = express()
        app.use(express.json())
        const repo = new MockUserRepository()
        userService = new UserService(repo) // Create the actual service
        userController = new UserController(userService) // Create the real controller
        app.use('/users', createUserRouter(userController)) // Add the real router
    })

    describe('GET /users', () => {
        it('should return 200 and an empty array when no users exist', async () => {
            const response = await request(app).get('/users')
            expect(response.status).toBe(200)
            expect(response.body).toEqual([])
        })
    })

    describe('GET /users/:id', () => {
        it('should return 404 for invalid user id', async () => {
            const response = await request(app).get('/users/invalid-id')
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty(
                'message',
                'User with id invalid-id not found'
            )
        })

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).get(
                '/users/60d21b4667d0d8992e610c85'
            ) // Valid but non-existent id
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty(
                'message',
                'User with id 60d21b4667d0d8992e610c85 not found'
            )
        })

        it('should return 200 for a valid user id', async () => {
            const user = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
            }
            const resUser = await request(app).post('/users').send(user) // Create the user in the repository
            const response = await request(app).get('/users/' + resUser.body.id)
            expect(response.status).toBe(200)
            expect(response.body).toEqual(resUser.body)
        })
    })
    describe('GET /users/email/:email', () => {
        it('should return 400 for invalid user email', async () => {
            const response = await request(app).get(
                '/users/email/invalid-email'
            )
            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Invalid params')
        })

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).get('/users/email/john@doe.com') // Valid but non-existent id
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty(
                'message',
                'User with email john@doe.com not found'
            )
        })

        it('should return 200 for a valid user email', async () => {
            const user = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
            }
            const resUser = await request(app).post('/users').send(user) // Create the user in the repository
            const response = await request(app).get(
                '/users/email/' + user.email
            )
            expect(response.status).toBe(200)
            expect(response.body).toEqual(resUser.body)
        })
    })

    describe('POST /users', () => {
        it('should return 400 for invalid input', async () => {
            const invalidUser = { name: 'John Doe' } // Missing email
            const response = await request(app).post('/users').send(invalidUser)
            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Invalid body')
        })

        it('should return 409 for duplicate email', async () => {
            const user = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
            }
            await request(app).post('/users').send(user)
            const duplicateUser = user
            duplicateUser.id = '2' // Same email
            const response = await request(app)
                .post('/users')
                .send(duplicateUser)
            expect(response.status).toBe(409)
            expect(response.body).toHaveProperty(
                'message',
                'Email john@example.com already exists'
            )
        })

        it('should return 201 for a valid user', async () => {
            const validUser = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
            }
            const response = await request(app).post('/users').send(validUser)
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('id')
            const resUser = await request(app).get('/users/' + response.body.id)
            expect(resUser.status).toEqual(200)
            expect(resUser.body).toEqual(validUser)
        })
    })

    describe('PUT /users/:id', () => {
        it('should return 400 for invalid input', async () => {
            const validUser = { name: 'John Doe', email: 'john@example.com' }
            await request(app).post('/users').send(validUser) // Create a user to update
            const invalidUpdate = { name: '' } // Empty name is invalid
            const response = await request(app)
                .put('/users/60d21b4667d0d8992e610c85')
                .send(invalidUpdate)
            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('message', 'Invalid body')
        })

        it('should return 404 for a non-existent user', async () => {
            const validUpdate = { name: 'Jane Doe', email: 'jane@example.com' }
            const response = await request(app)
                .put('/users/60d21b4667d0d8992e610c85')
                .send(validUpdate)
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty(
                'message',
                'User with id 60d21b4667d0d8992e610c85 not found'
            )
        })

        it('should return 200 for a valid update', async () => {
            const user = {
                id: '1',
                name: 'Jane Doe',
                email: 'jane@example.com',
            }
            const res = await request(app).post('/users/').send(user)
            const id = res.body.id
            const validUpdate = { name: 'jack Doe' }
            const response = await request(app)
                .put('/users/' + id)
                .send(validUpdate)
            expect(response.status).toBe(200)
        })
        it('should not update the id', async () => {
            const user = {
                id: '1',
                name: 'Jane Doe',
                email: 'jane@example.com',
            }
            const res = await request(app).post('/users/').send(user)
            const id = res.body.id
            const update = { id: 'new ID' }
            const response = await request(app)
                .put('/users/' + id)
                .send(update)
            expect(response.status).toBe(200)
            expect(response.body.id).toEqual(id)
        })
    })

    describe('DELETE /users/:id', () => {
        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).delete(
                '/users/60d21b4667d0d8992e610c85'
            )
            expect(response.status).toBe(404)
            expect(response.body).toHaveProperty(
                'message',
                'User with id 60d21b4667d0d8992e610c85 not found'
            )
        })

        it('should return 204 for a successful deletion', async () => {
            const validUser = {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
            }
            const res = await request(app).post('/users').send(validUser)
            const id = res.body.id
            const response = await request(app).delete('/users/' + id)
            expect(response.status).toBe(204)
            const resUser = await request(app).get('/users/' + id)
            expect(resUser.status).toEqual(404)
        })
    })
})
=======
import express from 'express';
import request from 'supertest';
import {createUserRouter} from '../src/routes/UserRoutes';
import {UserController} from '../src/controllers/UserController';
import {UserService} from '../src/services/UserService'; // Assuming the controller depends on a UserService
import {MockUserRepository} from "./MockUserRepository";

describe('UserRoutes - Integration Tests', () => {
    let app: express.Application;
    let userService: UserService;
    let userController: UserController;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        const repo = new MockUserRepository();
        userService = new UserService(repo); // Create the actual service
        userController = new UserController(userService); // Create the real controller
        app.use('/users', createUserRouter(userController)); // Add the real router
    });

    describe('GET /users', () => {
        it('should return 200 and an empty array when no users exist', async () => {
            const response = await request(app).get('/users');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('GET /users/:id', () => {
        it('should return 404 for invalid user id', async () => {
            const response = await request(app).get('/users/invalid-id');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User with id invalid-id not found');
        });

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).get('/users/60d21b4667d0d8992e610c85'); // Valid but non-existent id
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User with id 60d21b4667d0d8992e610c85 not found');
        });

        it('should return 200 for a valid user id', async () => {
            const user = {id: "1", name: 'John Doe', email: 'john@example.com'};
            const resUser = await request(app).post("/users").send(user); // Create the user in the repository
            const response = await request(app).get('/users/' + resUser.body.id);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(resUser.body);
        });
    });
    describe('GET /users/email/:email', () => {
        it('should return 400 for invalid user email', async () => {
            const response = await request(app).get('/users/email/invalid-email');
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid params');
        });

        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).get('/users/email/john@doe.com'); // Valid but non-existent id
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User with email john@doe.com not found');
        });

        it('should return 200 for a valid user email', async () => {
            const user = {id: "1", name: 'John Doe', email: 'john@example.com'};
            const resUser = await request(app).post("/users").send(user); // Create the user in the repository
            const response = await request(app).get('/users/email/' + user.email);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(resUser.body);
        });
    });

    describe('POST /users', () => {
        it('should return 400 for invalid input', async () => {
            const invalidUser = { name: 'John Doe' }; // Missing email
            const response = await request(app).post('/users').send(invalidUser);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid body');
        });

        it('should return 409 for duplicate email', async () => {
            const user = {id: "1", name: 'John Doe', email: 'john@example.com'};
            await request(app).post('/users').send(user);
            const duplicateUser = user;
            duplicateUser.id = "2"// Same email
            const response = await request(app).post('/users').send(duplicateUser);
            expect(response.status).toBe(409);
            expect(response.body).toHaveProperty('message', 'Email john@example.com already exists');
        });

        it('should return 201 for a valid user', async () => {
            const validUser = {id: "1", name: 'John Doe', email: 'john@example.com'};
            const response = await request(app).post('/users').send(validUser);
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            const resUser = await request(app).get('/users/' + response.body.id);
            expect(resUser.status).toEqual(200);
            expect(resUser.body).toEqual(validUser);
        });
    });

    describe('PUT /users/:id', () => {
        it('should return 400 for invalid input', async () => {
            const validUser = { name: 'John Doe', email: 'john@example.com' };
            await request(app).post('/users').send(validUser); // Create a user to update
            const invalidUpdate = { name: '' }; // Empty name is invalid
            const response = await request(app).put('/users/60d21b4667d0d8992e610c85').send(invalidUpdate);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid body');
        });

        it('should return 404 for a non-existent user', async () => {
            const validUpdate = { name: 'Jane Doe', email: 'jane@example.com' };
            const response = await request(app).put('/users/60d21b4667d0d8992e610c85').send(validUpdate);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User with id 60d21b4667d0d8992e610c85 not found');
        });

        it('should return 200 for a valid update', async () => {
            const user = {id: "1", name: 'Jane Doe', email: 'jane@example.com'};
            const res = await request(app).post('/users/').send(user);
            const id = res.body.id
            const validUpdate = {name : "jack Doe" };
            const response = await request(app).put('/users/'+id).send(validUpdate);
            expect(response.status).toBe(200);
        });
        it("should not update the id", async () => {
            const user = {id: "1", name: 'Jane Doe', email: 'jane@example.com'};
            const res = await request(app).post('/users/').send(user);
            const id = res.body.id
            const update = {id: "new ID"};
            const response = await request(app).put('/users/' + id).send(update);
            expect(response.status).toBe(200);
            expect(response.body.id).toEqual(id);
        });
    });

    describe('DELETE /users/:id', () => {
        it('should return 404 for a non-existent user', async () => {
            const response = await request(app).delete('/users/60d21b4667d0d8992e610c85');
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User with id 60d21b4667d0d8992e610c85 not found');
        });

        it('should return 204 for a successful deletion', async () => {
            const validUser = {id: "1", name: 'John Doe', email: 'john@example.com'};
            const res = await request(app).post('/users').send(validUser);
            const id = res.body.id;
            const response = await request(app).delete('/users/' + id );
            expect(response.status).toBe(204);
            const resUser = await request(app).get('/users/' + id);
            expect(resUser.status).toEqual(404);
        });
    });
});
>>>>>>> c774751 (chore: fix project structure bug)
