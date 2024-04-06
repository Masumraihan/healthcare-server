import { Patient, Prisma, UserStatus } from "@prisma/client";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import { patientSearchableFields } from "./patient.constant";
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface";
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

const updateIntoDb = async (id: string, payload: IPatientUpdate): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = prisma.$transaction(async (transactionClient) => {
    // UPDATE PATIENT DATA
    await transactionClient.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        medicalReport: true,
        PatientHealthData: true,
      },
    });

    // UPSERT HEALTH DATA
    if (patientHealthData) {
      await transactionClient.patientHealthData.upsert({
        where: {
          patientId: id,
        },
        update: patientHealthData,
        create: { ...patientHealthData, patientId: id },
      });
      if (medicalReport) {
        await transactionClient.medicalReport.create({
          data: {
            patientId: id,
            ...medicalReport,
          },
        });
      }
    }

    const responseData = await transactionClient.patient.findUnique({
      where: {
        id,
      },
      include: {
        medicalReport: true,
        PatientHealthData: true,
      },
    });
    return responseData;
  });

  return result;
};

const deleteById = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (tx) => {
    //  DELETE ALL MEDICAL REPORT
    await tx.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });
    // DELETE HEALTH DATA
    await tx.patientHealthData.delete({
      where: {
        patientId: id,
      },
    });
    // DELETE PATIENT DATA
    const deletedPatient = await tx.patient.delete({
      where: {
        id,
      },
    });
    await tx.user.delete({
      where: {
        email: deletedPatient.email,
      },
    });
    return deletedPatient;
  });
  return result;
};

const softDeleteById = async (id: string) => {
  const result = await prisma.$transaction(async (tx) => {
    const deletePatient = await tx.patient.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
    await tx.user.update({
      where: {
        email: deletePatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return deletePatient;
  });
  return result;
};

export const patientServices = {
  getAllPatient,
  getByIdFromDb,
  updateIntoDb,
  deleteById,
  softDeleteById,
};
