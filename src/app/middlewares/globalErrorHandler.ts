import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TokenExpiredError } from "jsonwebtoken";
import ApiError from "../errors/ApiError";

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let success = false;

  let error = null;
  if (err instanceof Prisma.PrismaClientValidationError) {
    message = "Validation error";
    error = err.message;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      message = "Record already exists";
      error = err.meta;
    }
  } else if (err instanceof TokenExpiredError) {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = "Token has expired";
    error = err;
  } else if (err instanceof ApiError) {
    statusCode = err.statuscode;
    message = err.message;
    error = err;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
