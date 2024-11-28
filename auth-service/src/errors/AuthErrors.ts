export class UserAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`User with Email ${email} already exists`);
    }
}

export class UserNotFoundError extends Error {
    constructor(email: string) {
        super(`User with email ${email} not found`);
    }
}

export class InvalidPasswordError extends Error {
    constructor() {
        super(`Invalid password`);
    }
}

export class InvalidTokenError extends Error {
    constructor() {
        super(`Invalid token`);
    }
}
