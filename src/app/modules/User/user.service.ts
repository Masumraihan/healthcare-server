import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import prisma from "../../../shared/prisma";

const createAdmin = async (req: Request) => {
  const file = req.file;
  const body = req.body;
  if (file) {
    const uploadImageToCloudinary = await fileUploader.uploadToCloudinary(file);
    body.admin.profilePhoto = uploadImageToCloudinary?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const userData = {
    email: body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: body.admin,
    });
    return createdAdminData;
  });

  return result;
};

export const userService = {
  createAdmin,
};
