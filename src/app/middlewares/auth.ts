import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new Error("you are not authorized");
      }

      const decodedData = jwtHelpers.verifyToken(token, config.jwt.jwt_secret as string);
      if (roles.length && !roles.includes(decodedData.role)) {
        throw new Error("you are not authorized");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
