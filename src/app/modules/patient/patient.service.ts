import { Prisma } from "@prisma/client";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import { patientSearchableFields } from "./patient.constant";
import { IPatientFilterRequest } from "./patient.interface";
import prisma from "../../../shared/prisma";

const getAllPatient = async (query: IPatientFilterRequest, option: IPaginationOptions) => {
  const andConditions: Prisma.PatientWhereInput[] = [];
  const { searchTerm, ...filterQuery } = query;
  const { page, limit, skip } = paginationHelper.calculatePagination(option);

  if (query.searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: query.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  if (Object.keys(filterQuery).length > 0) {
    andConditions.push({
      AND: Object.keys(filterQuery).map((key) => ({
        [key]: {
          equals: (filterQuery as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.PatientWhereInput = { AND: andConditions };

  const result = await prisma.patient.findMany({
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
    include: {
      medicalReport: true,
      PatientHealthData: true,
    },
  });

  const total = await prisma.patient.count({
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

const getByIdFromDb = async (id: string) => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      PatientHealthData: true,
    },
  });
  return result;
};

const updateIntoDb = async (id: string, payload: any) => {
  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.patient.update({
    where: {
      id,
    },
    data: payload,
    include: {
      medicalReport: true,
      PatientHealthData: true,
    },
  });
  return result;
};

export const patientServices = {
  getAllPatient,
  getByIdFromDb,
  updateIntoDb,
};
