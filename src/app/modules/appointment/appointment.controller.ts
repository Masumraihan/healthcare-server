import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { appointmentService } from "./appointment.service";
import { JwtPayload } from "jsonwebtoken";

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

export const appointmentController = {
  createAppointmentIntoDb,
};
