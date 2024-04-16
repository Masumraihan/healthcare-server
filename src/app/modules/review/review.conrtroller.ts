import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { reviewService } from "./review.service";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../../shared/pick";
import { reviewFilterableFields } from "./review.constant";

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

const getAllFromDb = catchAsync(async (req, res) => {
  const query = pick(req.query, reviewFilterableFields);
  const options = pick(req.query, ["sortBy", "sortOrder", "page", "limit"]);

  const result = await reviewService.getAllFromDb(query, options);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Reviews fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const reviewController = {
  insertIntoDb,
  getAllFromDb,
};
