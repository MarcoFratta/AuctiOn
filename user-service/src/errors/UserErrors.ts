export class UserNotFoundError extends Error {
    constructor(id: string) {
        super(`User with ID ${id} not found`);
    }
}
export class UpdateUserError extends Error {
    constructor(id: string) {
        super(`User with ID ${id} not found`);
    }
}
export class DeleteUserError extends Error {
    constructor(id: string) {
        super(`User with ID ${id} not found`);
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
    }
}