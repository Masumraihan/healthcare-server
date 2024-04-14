import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { reviewService } from "./review.service";
import { JwtPayload } from "jsonwebtoken";

const insertIntoDb = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await reviewService.insertIntoDb(user, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Review created successfully",
    data: result,
  });
});

export const reviewController = {
  insertIntoDb,
};
