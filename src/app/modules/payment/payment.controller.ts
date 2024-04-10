import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { paymentService } from "./payment.service";

const initPayment = catchAsync(async (req, res) => {
  const result = await paymentService.initPayment(req.params.paymentId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});
const validatePayment = catchAsync(async (req, res) => {
  const result = await paymentService.validatePayment(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

export const paymentController = { initPayment, validatePayment };
