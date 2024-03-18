import { Request, Response } from "express";
import { userService } from "../../../user.service";

const createAdmin = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await userService.createAdmin(data);
    res.status(201).json({
      success: true,
      message: "Admin Created Successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error?.name || "Something went wrong",
      error: error || "Something went wrong",
    });
  }
};

export const userController = {
  createAdmin,
};
