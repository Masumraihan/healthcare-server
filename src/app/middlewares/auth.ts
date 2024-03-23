import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "you are not authorized");
      }

      const decodedData = jwtHelpers.verifyToken(token, config.jwt.jwt_secret as string);
      if (roles.length && !roles.includes(decodedData.role)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "you are not authorized");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
