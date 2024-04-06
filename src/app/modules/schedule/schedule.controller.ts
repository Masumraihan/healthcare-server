import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { scheduleService } from "./schedule.service";

const insertIntoDb = catchAsync(async (req, res) => {
  const result = await scheduleService.insertIntoDb(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Schedule created successfully!",
    data: result,
  });
});

export const scheduleController = {
  insertIntoDb,
};
