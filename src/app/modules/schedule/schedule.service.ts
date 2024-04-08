import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";
import { Prisma, Schedule } from "@prisma/client";
import { ISchedule, IScheduleFilter } from "./schedule.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import { JwtPayload } from "jsonwebtoken";

const insertIntoDb = async (payload: ISchedule): Promise<Schedule[]> => {
  const intervalTime = 30;
  const schedules: Schedule[] = [];
  const { startDate, endDate, startTime, endTime } = payload;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(startTime.split(":")[0])),
        Number(startTime.split(":")[1]),
      ),
    );
    const endDateTime = new Date(
      addMinutes(
        addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(endTime.split(":")[0])),
        Number(endTime.split(":")[1]),
      ),
    );

    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime,
        endDateTime: addMinutes(startDateTime, intervalTime),
      };

      const existingScheduleData = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingScheduleData) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      //  UPDATE 30 MINUTES INTERVAL FOR CREATING SCHEDULE FOR EVERY 30 MINUTES.
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    // UPDATE DATE FOR CREATE EACH DATE SCHEDULE WHICH PROVIDED FROM CLIENT THROW PAYLOAD.
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

const getAllFromDb = async (
  query: IScheduleFilter,
  option: IPaginationOptions,
  user: JwtPayload,
) => {
  const andConditions: Prisma.ScheduleWhereInput[] = [];
  const { startDate, endDate, ...filterQuery } = query;
  const { page, limit, skip } = paginationHelper.calculatePagination(option);

  if (startDate && endDate) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: startDate,
          },
        },
        {
          endDateTime: {
            lte: endDate,
          },
        },
      ],
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

  const doctorSchedule = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
  });

  const scheduleIds = doctorSchedule.map((schedule) => schedule.scheduleId);

  const whereCondition: Prisma.ScheduleWhereInput = { AND: andConditions };

  const result = await prisma.schedule.findMany({
    where: {
      ...whereCondition,
      id: {
        notIn: scheduleIds,
      },
    },
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

  const total = await prisma.schedule.count({
    where: { ...whereCondition, id: { notIn: scheduleIds } },
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

export const scheduleService = {
  insertIntoDb,
  getAllFromDb,
};
