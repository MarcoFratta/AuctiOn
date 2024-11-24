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
export class EmailAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`Email ${email} already exists`);
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
    }
}