import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { prescriptionService } from "./prescription.service";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../../shared/pick";

const insertIntoDb = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;

  const result = await prescriptionService.insertIntoDb(user, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Prescription created successfully",
    data: result,
  });
});

const getAllFromDb = catchAsync(async (req, res) => {
  const filterQuery = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await prescriptionService.getAllFromDb(filterQuery);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Prescription fetched successfully",
    meta: result.meta,
    data: result.data,
  });
})

const myPrescriptions = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const filterQuery = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await prescriptionService.myPrescriptions(user, filterQuery);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Prescription fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});
export const prescriptionController = {
  insertIntoDb,
  getAllFromDb,
  myPrescriptions,
};
