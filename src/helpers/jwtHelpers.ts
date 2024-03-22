import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const generateToken = (
  payload: { email: string; role: UserRole },
  secret: Secret,
  expiresIn: string,
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });
  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
