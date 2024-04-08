import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { doctorScheduleService } from "./doctorSchedule.service";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../../shared/pick";

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
const getMySchedules = catchAsync(async (req, res) => {
  const filterQuery = pick(req.query, ["startDate", "endDate", "isBooked"]);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const user = req.user as JwtPayload;
  const result = await doctorScheduleService.getMySchedules(filterQuery, option, user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Schedule fetched successfully!",
    data: result,
  });
});

const deleteFromDb = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await doctorScheduleService.deleteFromDb(req.params.id, user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor Schedule deleted successfully",
    data: result,
  });
});

export const doctorScheduleController = {
  insertIntoDb,
  getMySchedules,
  deleteFromDb,
};
