import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { patientFilterableFields } from "./patient.constant";
import { Request, Response } from "express";
import { patientServices } from "./patient.service";

const getAllPatient = catchAsync(async (req: Request, res: Response) => {
  const query = pick(req.query, patientFilterableFields);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const result = await patientServices.getAllPatient(query, option);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patients fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getByIdFromDb = catchAsync(async (req, res) => {
  const result = await patientServices.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patient fetched successfully",
    data: result,
  });
});
const updateIntoDb = catchAsync(async (req, res) => {
  const result = await patientServices.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deleteById = catchAsync(async (req, res) => {
  const result = await patientServices.deleteById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

const softDeleteById = catchAsync(async (req, res) => {
  const result = await patientServices.softDeleteById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

export const patientController = {
  getAllPatient,
  getByIdFromDb,
  updateIntoDb,
  deleteById,
  softDeleteById,
};
