import { Admin, Prisma } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { adminSearchableFields } from "./admin.contant";

const getAllAdmin = async (query: Record<string, unknown>, option: any) => {
  const andConditions: Prisma.AdminWhereInput[] = [];
  const { searchTerm, ...filterQuery } = query;
  const { page, limit, skip } = paginationHelper.calculatePagination(option);

  if (query.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
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
          equals: filterQuery[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AdminWhereInput = { AND: andConditions };

  const result = await prisma.admin.findMany({
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

  const total = await prisma.admin.count({
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
  const result = prisma.admin.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateDataIntoDb = async (id: string, payload: Partial<Admin>) => {
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteFromDb = async (id: string) => {
  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.delete({
      where: {
        id,
      },
    });
    await transactionClient.user.delete({
      where: {
        email: adminDeletedData.email,
      },
    });
    return adminDeletedData;
  });
  return result;
};

export const adminServices = {
  getAllAdmin,
  getByIdFromDb,
  updateDataIntoDb,
  deleteFromDb,
};
