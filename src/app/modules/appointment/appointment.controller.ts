import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { appointmentService } from "./appointment.service";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../../shared/pick";

const createAppointmentIntoDb = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await appointmentService.createAppointmentIntoDb(req.body, user);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Appointment created successfully!",
    data: result,
  });
});

const getAllFromDb = catchAsync(async (req, res) => {
  const filterQuery = pick(req.query, ["status", "paymentStatus"]);
  const option = pick(req.query, ["sortBy", "sortOrder", "page", "limit"]);

  const result = await appointmentService.getAllFromDb(filterQuery, option);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointment fetched successfully!",
    data: result,
  });
});
const getMyAppointment = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;

  const filterQuery = pick(req.query, ["status", "paymentStatus"]);
  const option = pick(req.query, ["sortBy", "sortOrder", "page", "limit"]);

  const result = await appointmentService.getMyAppointment(user, filterQuery, option);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Appointment fetched successfully!",
    data: result,
  });
});

export const appointmentController = {
  createAppointmentIntoDb,
  getAllFromDb,
  getMyAppointment,
};
