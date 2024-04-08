import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import { Prisma } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const insertIntoDb = async (user: JwtPayload, payload: { scheduleIds: string[] }) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData: { doctorId: string; scheduleId: string }[] = payload.scheduleIds.map(
    (scheduleId) => ({ doctorId: doctorData.id, scheduleId }),
  );
  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
  return result;
};

const getMySchedules = async (query: any, option: IPaginationOptions, user: JwtPayload) => {
  const andConditions: Prisma.DoctorSchedulesWhereInput[] = [];
  const { startDate, endDate, ...filterQuery } = query;
  const { page, limit, skip } = paginationHelper.calculatePagination(option);

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: {
              gte: startDate,
            },
          },
        },
        {
          schedule: {
            endDateTime: {
              lte: endDate,
            },
          },
        },
      ],
    });
  }

  if (Object.keys(filterQuery).length > 0) {
    if (typeof filterQuery.isBooked === "string" && filterQuery.isBooked === "true") {
      filterQuery.isBooked = true;
    } else if (typeof filterQuery.isBooked === "string" && filterQuery.isBooked === "false") {
      filterQuery.isBooked = false;
    }
    andConditions.push({
      AND: Object.keys(filterQuery).map((key) => ({
        [key]: {
          equals: (filterQuery as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.DoctorSchedulesWhereInput = { AND: andConditions };

  const result = await prisma.doctorSchedules.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy:
      option.sortBy && option.sortOrder
        ? {
            [option.sortBy]: option.sortOrder,
          }
        : {},
    include: {
      doctor: true,
      schedule: true,
    },
  });

  const total = await prisma.doctorSchedules.count({
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

const deleteFromDb = async (scheduleId: string, user: JwtPayload) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isBooked = await prisma.doctorSchedules.findFirst({
    where: {
      doctorId: doctorData.id,
      scheduleId: scheduleId,
      isBooked: true,
    },
  });

  if (isBooked) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You can not delete any booked schedule");
  }

  const result = await prisma.doctorSchedules.delete({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleId,
      },
    },
  });
  return result;
};

export const doctorScheduleService = {
  insertIntoDb,
  getMySchedules,
  deleteFromDb,
};
