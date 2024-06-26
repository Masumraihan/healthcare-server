import { Prisma, Schedule } from "@prisma/client";
import { addHours, addMinutes, format } from "date-fns";
import { JwtPayload } from "jsonwebtoken";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { ISchedule, IScheduleFilter } from "./schedule.interface";

const convertDateTime = async (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + offset);
};

const insertIntoDb = async (payload: ISchedule): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;

  const intervalTime = 30;

  const schedules: Schedule[] = [];

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

    console.log(startDateTime, addMinutes(startDateTime, intervalTime));

    while (startDateTime < endDateTime) {
      //const scheduleData = {
      //  startDateTime,
      //  endDateTime: addMinutes(startDateTime, intervalTime),
      //};

      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, intervalTime));
      console.log(startDateTime, endDateTime);

      const scheduleData = {
        startDate: s,
        endDate: e,
      };

      const existingScheduleData = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDate,
          endDateTime: scheduleData.endDate,
        },
      });

      if (!existingScheduleData) {
        const result = await prisma.schedule.create({
          data: {
            startDateTime: scheduleData.startDate,
            endDateTime: scheduleData.endDate,
          },
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

const getByIdFromDb = async (id: string) => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
    include: {
      doctorSchedules: true,
    },
  });
  return result;
};

const deleteById = async (id: string) => {
  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      scheduleId: id,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    if (doctorSchedules.length > 0) {
      await transactionClient.doctorSchedules.deleteMany({
        where: {
          scheduleId: id,
        },
      });
    }
    const deletedSchedule = await transactionClient.schedule.delete({
      where: {
        id,
      },
    });
    return deletedSchedule;
  });

  return result;
};

export const scheduleService = {
  insertIntoDb,
  getAllFromDb,
  getByIdFromDb,
  deleteById,
};
