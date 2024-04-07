import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";

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

const getAllFromDb = async (user: JwtPayload) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const result = await prisma.doctorSchedules.findMany({
    where: {
      doctorId: doctorData.id,
    },
  });
  return result;
};

export const doctorScheduleService = {
  insertIntoDb,
  getAllFromDb,
};
