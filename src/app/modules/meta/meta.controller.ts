import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { metaService } from "./meta.service";
import sendResponse from "../../../shared/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const fetchDashboardMetaData = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;

  const result = await metaService.fetchDashboardMetaData(user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Meta data fetched successfully",
    data: result,
  });
});

export const metaController = {
  fetchDashboardMetaData,
};
