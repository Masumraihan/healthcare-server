import { Request, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.contant";

const getAllAdmin = async (req: Request, res: Response) => {
  const query = pick(req.query, adminFilterableFields);
  const option = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  try {
    const result = await adminServices.getAllAdmin(query, option);
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

export const adminControllers = {
  getAllAdmin,
};
