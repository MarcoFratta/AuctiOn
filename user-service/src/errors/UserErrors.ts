export class UserNotFoundError extends Error {
    constructor(key: string, val: string) {
        super(`User with ${key} ${val} not found`);
    }
}
export class UpdateUserError extends Error {
    constructor(id: string) {
        super(`User with id ${id} not found`);
    }
}
export class DeleteUserError extends Error {
    constructor(id: string) {
        super(`User with id ${id} not found`);
    }
}
export class EmailAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`Email ${email} already exists`);
    }
}

export class IdAlreadyExistsError extends Error {
    constructor(id: string) {
        super(`Id ${id} already exists`);
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
    }
}