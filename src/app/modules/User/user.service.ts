import { Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import prisma from "../../../shared/prisma";
import { IFile } from "../../interfaces/file";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import { adminSearchableFields } from "../admin/admin.contant";
import { userSearchableFields } from "./user.contant";

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
const createDoctor = async (req: Request) => {
  const file = req.file;
  const body = req.body;
  if (file) {
    const uploadImageToCloudinary = await fileUploader.uploadToCloudinary(file);
    body.doctor.profilePhoto = uploadImageToCloudinary?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const userData = {
    email: body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: body.doctor,
    });
    return createdDoctorData;
  });

  return result;
};
const createPatient = async (req: Request) => {
  const file = req.file as IFile;
  const body = req.body;
  if (file) {
    const uploadImageToCloudinary = await fileUploader.uploadToCloudinary(file);
    body.patient.profilePhoto = uploadImageToCloudinary?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(body.password, 12);

  const userData = {
    email: body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdPatientData = await transactionClient.patient.create({
      data: body.patient,
    });
    return createdPatientData;
  });

  return result;
};

const getAllAdmin = async (query: any, option: IPaginationOptions) => {
  const andConditions: Prisma.UserWhereInput[] = [];
  const { searchTerm, ...filterQuery } = query;
  const { page, limit, skip } = paginationHelper.calculatePagination(option);

  if (query.searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterQuery).length > 0) {
    andConditions.push({
      AND: Object.keys(filterQuery).map((key) => ({
        [key]: {
          equals: (filterQuery as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      option.sortBy && option.sortOrder
        ? {
            [option.sortBy]: option.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });

  const total = await prisma.user.count({
    where: whereCondition,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const userService = {
  createAdmin,
  createDoctor,
  createPatient,
};
