<<<<<<< HEAD
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET!
const expiresIn = process.env.JWT_EXPIRES_IN ?? '1h'

export const generateToken = (payload: object) => {
    return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, secret)
}
=======
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET!;
const expiresIn = process.env.JWT_EXPIRES_IN ?? '1h';

export const generateToken = (payload: object) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, secret);
};
>>>>>>> c774751 (chore: fix project structure bug)
