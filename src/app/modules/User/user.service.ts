import { Prisma, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import prisma from "../../../shared/prisma";
import { IFile } from "../../interfaces/file";
import { IPaginationOptions } from "../../interfaces/pagination";
import { userSearchableFields } from "./user.constant";

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

const getAllUser = async (query: any, option: IPaginationOptions) => {
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
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      needsPasswordChange: true,
      admin: true,
      patient: true,
      doctor: true,
    },
    //include: {
    //  admin: true,
    //  patient: true,
    //  doctor: true,
    //},
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

const changeProfileStatus = async (id: string, data: { status: UserStatus }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
      status: UserStatus.ACTIVE,
    },
  });

  const result = await prisma.user.update({
    where: {
      id,
    },
    data,
  });
  return result;
};

const getMyProfile = async (user: JwtPayload) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      status: true,
      email: true,
      role: true,
      needsPasswordChange: true,
    },
  });

  let profileData;
  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileData = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileData = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileData = await prisma.doctor.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileData = await prisma.patient.findUnique({
      where: {
        email: userInfo.email,
      },
    });
  }
  return { ...userInfo, ...profileData };
};

const updateMyProfile = async (user: JwtPayload, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file as IFile;

  console.log({ user, file });
  if (file) {
    const uploadImageToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadImageToCloudinary?.secure_url;
  }

  let profileData;
  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileData = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileData = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.DOCTOR) {
    profileData = await prisma.doctor.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.PATIENT) {
    profileData = await prisma.patient.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }
  return { ...profileData };
};

export const userService = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUser,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
