import { Request, Response } from "express";
import { userService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.contant";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Admin Created Successfully",
    data: result,
  });
});
const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createDoctor(req);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Doctor Created Successfully",
    data: result,
  });
});
const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createPatient(req);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Patient Created Successfully",
    data: result,
  });
});

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const query = pick(req.query, userFilterableFields);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await userService.getAllUser(query, option);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});
//const getByIdFromDb = catchAsync(async (req: Request, res: Response) => {
//  const { id } = req.params;
//  const result = await userService.getAllUser(id);
//  sendResponse(res, {
//    statusCode: StatusCodes.OK,
//    success: true,
//    message: "Admin fetched successfully",
//    data: result,
//  });
//});

const changeProfileStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await userService.changeProfileStatus(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User profile status changed",
    data: result,
  });
});
const getMyProfile = catchAsync(async (req, res) => {
  const result = await userService.getMyProfile(req.user!);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Profile data fetched successfully",
    data: result,
  });
});

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
  changeProfileStatus,
  getMyProfile,
};
