import { UserService } from "../src/services/UserService";
import { User } from "../src/schemas/User";
import { MockUserRepository } from "./MockUserRepository";
import {DeleteUserError, UpdateUserError} from "../src/errors/UserErrors";

describe("UserService with Mock Repository", () => {
    let userService: UserService;
    let mockRepository: MockUserRepository;

    beforeEach(() => {
        // Initialize the mock repository and inject it into the service
        mockRepository = new MockUserRepository();
        userService = new UserService(mockRepository);
    });

    describe("getUsers", () => {
        it("should return all users", async () => {
            const mockUsers: User[] = [
                { id: "000000000000000000000001", name: "John Doe", email: "john@example.com" },
                { id: "000000000000000000000002", name: "Jane Doe", email: "jane@example.com" },
            ];
            // Prepopulate the mock repository
            for (const user of mockUsers) {
                await mockRepository.create(user);
            }

            const users = await userService.getUsers();

            expect(users).toEqual(mockUsers);
        });
    });

    describe("getUserById", () => {
        it("should return a user by ID", async () => {
            const mockUser: User = { name: "John Doe", email: "john@example.com" };
            const res = await mockRepository.create(mockUser);

            const user = await userService.getUserById(res.id!);

            expect(user).toEqual({id: res.id, ...mockUser});
        });

        it("should throw an error if the user is not found", async () => {
            await expect(userService.getUserById("999")).rejects.toThrow("User with ID 999 not found");
        });
    });

    describe("createUser", () => {
        it("should create and return a new user", async () => {
            const newUser: Omit<User, "id"> = { name: "Jane Doe", email: "jane@example.com" };

            const result = await userService.createUser(newUser);

            expect(result).toEqual({ id: result.id, ...newUser });
        });
    });

    describe("updateUser", () => {
        it("should update and return the updated user", async () => {
            const user: User = { name: "John Doe", email: "john@example.com" };
            const res = await mockRepository.create(user);

            const updatedData = { name: "John Updated" };
            const result = await userService.updateUser(res.id!, updatedData);

            expect(result).toEqual({ id: res.id, ...user, ...updatedData });
        });

        it("should throw an error if the user to update is not found", async () => {
            await expect(userService.updateUser("999", { name: "Non-existent" }))
                .rejects.toThrow(new UpdateUserError("999")
            );
        });
    });

    describe("deleteUser", () => {
        it("should delete a user", async () => {
            const user: User = { name: "John Doe", email: "john@example.com" };
            const res = await mockRepository.create(user);

            await userService.deleteUser(res.id!);

            const users = await userService.getUsers();
            expect(users).toHaveLength(0);
        });

        it("should throw an error if the user to delete is not found", async () => {
            await expect(userService.deleteUser("999"))
                .rejects.toThrow(new DeleteUserError("999"));
        });
    });
});
