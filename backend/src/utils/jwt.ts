import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = {
  userId: string;
  tokenVersion: number;
};

const signJwt = jwt.sign as unknown as (
  payload: object,
  secret: string,
  options: { expiresIn: string }
) => string;

const verifyJwt = jwt.verify as unknown as (
  token: string,
  secret: string
) => JwtPayload;

export function signToken(payload: JwtPayload) {
  return signJwt(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export function verifyToken(token: string): JwtPayload {
  return verifyJwt(token, env.JWT_SECRET);
}