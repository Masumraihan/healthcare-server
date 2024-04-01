import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { doctorService } from "./doctor.service";
import { doctorFilterableFields } from "./doctor.constant";
import pick from "../../../shared/pick";

const getAllDoctor = catchAsync(async (req, res) => {
  const query = pick(req.query, doctorFilterableFields);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await doctorService.getAllDoctor(query, option);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDb = catchAsync(async (req, res) => {
  const result = await doctorService.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor fetched successfully",
    data: result,
  });
});

const deleteFromDb = catchAsync(async (req, res) => {
  const result = await doctorService.deleteFromDb(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

const softDeleteFromDb = catchAsync(async (req, res) => {
  const result = await doctorService.softDeleteFromDb(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

const updateIntoDb = catchAsync(async (req, res) => {
  const result = await doctorService.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Doctor update successfully",
    data: result,
  });
});

export const doctorController = {
  getAllDoctor,
  getByIdFromDb,
  updateIntoDb,
  deleteFromDb,
  softDeleteFromDb,
};
