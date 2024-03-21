import { Request, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.contant";

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

const getAllAdmin = async (req: Request, res: Response) => {
  const query = pick(req.query, adminFilterableFields);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  try {
    const result = await adminServices.getAllAdmin(query, option);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};
const getByIdFromDb = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminServices.getByIdFromDb(id);
    res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};
const updateDataIntoDb = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminServices.updateDataIntoDb(id, req.body);
    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};
const deleteFromDb = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminServices.deleteFromDb(id);
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};
const softDeleteFromDb = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminServices.softDeleteFromDb(id);
    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error?.name || "Something went wrong",
      error: error,
    });
  }
};

export const adminControllers = {
  getAllAdmin,
  getByIdFromDb,
  updateDataIntoDb,
  deleteFromDb,
  softDeleteFromDb,
};
