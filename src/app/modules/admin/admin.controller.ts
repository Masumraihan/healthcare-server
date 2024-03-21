import { NextFunction, Request, RequestHandler, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.contant";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const query = pick(req.query, adminFilterableFields);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await adminServices.getAllAdmin(query, option);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});
const getByIdFromDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminServices.getByIdFromDb(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin fetched successfully",
    data: result,
  });
});

const updateDataIntoDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminServices.updateDataIntoDb(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});
const deleteFromDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminServices.deleteFromDb(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});
const softDeleteFromDb = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminServices.softDeleteFromDb(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const adminControllers = {
  getAllAdmin,
  getByIdFromDb,
  updateDataIntoDb,
  deleteFromDb,
  softDeleteFromDb,
};
