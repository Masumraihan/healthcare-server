import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";
import { Schedule } from "@prisma/client";
import { ISchedule } from "./schedule.interface";

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
      //  UPDATE 30 MINUTES INTERVAL FOR CREATING SCHEDULE FOR EVERY 30 MINUTES
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    // UPDATE DATE FOR CREATE EACH DATE SCHEDULE WHICH PROVIDED FROM CLIENT THROW PAYLOAD.
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

export const scheduleService = {
  insertIntoDb,
};
