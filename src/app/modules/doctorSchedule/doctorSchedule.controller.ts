import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";
import { JwtPayload } from "jsonwebtoken";

const insertIntoDb = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await doctorScheduleService.insertIntoDb(user, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Doctor Schedule created successfully",
    data: result,
  });
});
const getAllFromDb = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await doctorScheduleService.getAllFromDb(user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor Schedule fetched successfully",
    data: result,
  });
});

export const doctorScheduleController = {
  insertIntoDb,
  getAllFromDb,
};
