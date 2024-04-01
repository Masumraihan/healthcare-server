import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { doctorService } from "./doctor.service";

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
  updateIntoDb,
};
