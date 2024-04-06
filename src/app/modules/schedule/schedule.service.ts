import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../../shared/prisma";

const insertIntoDb = async (payload: any) => {
  const intervalTime = 30;
  const schedules = [];
  const { startDate, endDate, startTime, endTime } = payload;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(startTime.split(":")[0])),
    );
    const endDateTime = new Date(
      addHours(`${format(currentDate, "yyyy-MM-dd")}`, Number(endTime.split(":")[0])),
    );

    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime,
        endDateTime: addMinutes(startDateTime, intervalTime),
      };

      const result = await prisma.schedule.create({
        data: scheduleData,
      });
      schedules.push(result);
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

export const scheduleService = {
  insertIntoDb,
};
