import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { authServices } from "./auth.service";

const loginUser = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);
  const { accessToken, needPasswordChange, refreshToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User login successfully",
    data: {
      accessToken,
      needPasswordChange,
    },
  });
});
const refreshToken = catchAsync(async (req, res) => {
  const result = await authServices.refreshToken(req.cookies.refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Token Created successfully",
    data: result,
  });
});

export const authControllers = {
  loginUser,
  refreshToken,
};
