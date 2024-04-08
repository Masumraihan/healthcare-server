import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { scheduleService } from "./schedule.service";
import pick from "../../../shared/pick";
import { JwtPayload } from "jsonwebtoken";

const insertIntoDb = catchAsync(async (req, res) => {
  const result = await scheduleService.insertIntoDb(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

const getAllFromDb = catchAsync(async (req, res) => {
  const filterQuery = pick(req.query, ["startDate", "endDate"]);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const user = req.user as JwtPayload;
  const result = await scheduleService.getAllFromDb(filterQuery, option, user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Schedule fetched successfully!",
    data: result,
  });
});

export const scheduleController = {
  insertIntoDb,
  getAllFromDb,
};
