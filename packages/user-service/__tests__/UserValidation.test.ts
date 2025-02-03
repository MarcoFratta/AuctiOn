import { userSchema } from '../src/schemas/User'
import { validateSchema, ValidationError } from '@auction/common/validation'

describe('validateSchema', () => {
  it('should validate the object successfully if the input is valid', () => {
    const validInput = {
      id: '1234',
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    const result = validateSchema(userSchema, validInput);

    expect(result).toEqual(validInput);
  });

  it('should throw a ParseError if the input is invalid', () => {
    const invalidInput = {
      name: '',
      email: 'not-an-email',
    };

    expect(() => validateSchema(userSchema, invalidInput)).toThrow(ValidationError)

    try {
      validateSchema(userSchema, invalidInput);
    } catch (error) {
      if (error instanceof ValidationError) {
        expect(error.message).toEqual(
          'Validation error: ' +
            'Required at "id";' +
            ' String must contain at least 1 character(s) at' +
            ' "name"; Invalid email at "email"',
        );
      } else {
        throw error; // Re-throw unexpected errors
      }
    }
  });

  it('should throw a ParseError if a required field is missing', () => {
    const missingFieldInput = {
      email: 'john.doe@example.com',
    };

    expect(() => validateSchema(userSchema, missingFieldInput)).toThrow(ValidationError)
  });
});
