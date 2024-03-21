import { Response } from "express";

const sendResponse = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: {
      total: number;
      limit: number;
      page: number;
    };
    data: T | null | undefined;
  },
) => {
  res.status(jsonData.statusCode).json({
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta,
    data: jsonData.data,
  });
};
export default sendResponse;
