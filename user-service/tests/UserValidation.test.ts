import { validateSchema, ParseError } from '../src/utils/Validator';
import { UserSchema } from '../src/schemas/User';

describe('validateSchema', () => {
    it('should validate the object successfully if the input is valid', () => {
        const validInput = {
            id: '123',
            name: 'John Doe',
            email: 'john.doe@example.com',
        };

        const result = validateSchema(UserSchema, validInput);

        expect(result).toEqual(validInput);
    });

    it('should throw a ParseError if the input is invalid', () => {
        const invalidInput = {
            name: '',
            email: 'not-an-email',
        };

        expect(() => validateSchema(UserSchema, invalidInput)).toThrow(ParseError);

        try {
            validateSchema(UserSchema, invalidInput);
        } catch (error) {
            if (error instanceof ParseError) {
                expect(error.message).toEqual(
                    "Validation error: String must contain at least 1 character(s) at" +
                    " \"name\"; Invalid email at \"email\"");
            } else {
                throw error; // Re-throw unexpected errors
            }
        }
    });

    it('should throw a ParseError if a required field is missing', () => {
        const missingFieldInput = {
            email: 'john.doe@example.com',
        };

        expect(() => validateSchema(UserSchema, missingFieldInput)).toThrow(ParseError);
    });

    it('should validate successfully when optional fields are omitted', () => {
        const validInput = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        };

        const result = validateSchema(UserSchema, validInput);

        expect(result).toEqual(validInput);
    });
});
