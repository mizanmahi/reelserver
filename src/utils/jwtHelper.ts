import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const createToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string
): string => {
  return jwt.sign(
    payload,
    secret,
    {
      algorithm: 'HS256',
      expiresIn: expiresIn,
    } as SignOptions);
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};


export const jwtHelpers = {
  createToken,
  verifyToken
};