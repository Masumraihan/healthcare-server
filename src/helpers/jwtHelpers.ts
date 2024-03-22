import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";

const generateToken = (
  payload: { email: string; role: UserRole },
  secret: string,
  expiresIn: string,
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });
  return token;
};

export const jwtHelpers = {
  generateToken,
};
