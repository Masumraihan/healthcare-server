import { Doctor, Prisma, UserStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorFilterRequest } from "./doctor.interface";
import { IPaginationOptions } from "../../interfaces/pagination";

const getAllDoctor = async (query: IDoctorFilterRequest, option: IPaginationOptions) => {
  const andConditions: Prisma.DoctorWhereInput[] = [];
  const { searchTerm, specialties, ...filterQuery } = query;
  const { page, limit, skip } = paginationHelper.calculatePagination(option);

  if (query.searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
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

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  const whereCondition: Prisma.DoctorWhereInput = { AND: andConditions };

  const result = await prisma.doctor.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      option.sortBy && option.sortOrder
        ? {
            [option.sortBy]: option.sortOrder,
          }
        : {
            averageRating: "desc",
          },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
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

const getByIdFromDb = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: true,
    },
  });
  return result;
};

const updateIntoDb = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    });

    if (specialties && specialties.length) {
      const deletedSpecialties = specialties.filter((specialty: any) => specialty.isDeleted);
      if (deletedSpecialties.length) {
        for (const specialty of deletedSpecialties) {
          await transactionClient.doctorSpecialties.deleteMany({
            where: {
              specialtiesId: specialty.specialtiesId,
            },
          });
        }
      }
      const createdSpecialties = specialties.filter((specialty: any) => !specialty.isDeleted);
      if (createdSpecialties.length) {
        for (const specialty of createdSpecialties) {
          await transactionClient.doctorSpecialties.create({
            data: {
              doctorId: id,
              specialtiesId: specialty.specialtiesId,
            },
          });
        }
      }
    }
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });
  return result;
};

const deleteFromDb = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedDoctor = await transactionClient.doctor.delete({
      where: {
        id,
      },
    });
    await transactionClient.user.delete({
      where: {
        email: deletedDoctor.email,
      },
    });
    return deletedDoctor;
  });
  return result;
};

const softDeleteFromDb = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.$transaction(async (transactionClient) => {
    const deletedDoctor = await transactionClient.doctor.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });
    await transactionClient.user.update({
      where: {
        email: deletedDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });
    return deletedDoctor;
  });
  return result;
};

export const doctorService = {
  getAllDoctor,
  getByIdFromDb,
  updateIntoDb,
  deleteFromDb,
  softDeleteFromDb,
};
