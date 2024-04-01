import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { specialtiesService } from "./specialties.service";

const insertIntoDb = catchAsync(async (req, res) => {
  const result = await specialtiesService.insertIntoDb(req);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Specialty created successfully",
    data: result,
  });
});
const getAllFromDb = catchAsync(async (req, res) => {
  const result = await specialtiesService.getAllFromDb();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Specialties fetched successfully",
    data: result,
  });
});
const deleteFromDb = catchAsync(async (req, res) => {
  const result = await specialtiesService.deleteFromDb(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const specialtiesController = {
  insertIntoDb,
  getAllFromDb,
  deleteFromDb,
};
