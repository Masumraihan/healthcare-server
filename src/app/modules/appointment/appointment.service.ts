import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import { v4 as uuid } from "uuid";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import { Appointment, AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const createAppointmentIntoDb = async (payload: any, user: JwtPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
    },
  });

  const doctorScheduleData = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId: string = uuid();

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: doctorScheduleData.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: doctorScheduleData.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });

    const today = new Date();
    const transactionId = `mr-healthcare-${today.getFullYear()}-${today.getMonth()}-${today.getDay()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`;

    await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return appointmentData;
  });

  return result;
};

const getAllFromDb = async (query: any, option: IPaginationOptions) => {
  const andConditions: Prisma.AppointmentWhereInput[] = [];
  const { page, limit, skip } = paginationHelper.calculatePagination(option);
  const { ...filterQuery } = query;

  if (Object.keys(filterQuery).length > 0) {
    andConditions.push({
      AND: Object.keys(filterQuery).map((key) => ({
        [key]: {
          equals: (filterQuery as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AppointmentWhereInput = { AND: andConditions };

  const result = await prisma.appointment.findMany({
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
      doctor: true,
      patient: {
        include: {
          medicalReport: true,
          PatientHealthData: true,
        },
      },
      schedule: true,
    },
  });

  const total = await prisma.appointment.count({
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
const getMyAppointment = async (user: JwtPayload, query: any, option: IPaginationOptions) => {
  const andConditions: Prisma.AppointmentWhereInput[] = [];
  const { page, limit, skip } = paginationHelper.calculatePagination(option);
  const { ...filterQuery } = query;

  if (Object.keys(filterQuery).length > 0) {
    andConditions.push({
      AND: Object.keys(filterQuery).map((key) => ({
        [key]: {
          equals: (filterQuery as any)[key],
        },
      })),
    });
  }

  if (user.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user.email,
      },
    });
  }

  const whereCondition: Prisma.AppointmentWhereInput = { AND: andConditions };

  const result = await prisma.appointment.findMany({
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
    include:
      user.role === UserRole.PATIENT
        ? {
            doctor: true,
            schedule: true,
          }
        : {
            patient: {
              include: {
                PatientHealthData: true,
                medicalReport: true,
              },
            },
            schedule: true,
          },
  });

  const total = await prisma.appointment.count({
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

const changeAppointmentStatus = async (
  appointId: string,
  status: AppointmentStatus,
  user: JwtPayload,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointId,
    },
    include: {
      doctor: true,
    },
  });

  if (user.role === UserRole.DOCTOR) {
    if (user.email !== appointmentData.doctor.email) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "This is not your appointment");
    }
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentData.id,
    },
    data: {
      status,
    },
  });
  return result;
};

const cancelUnpaidAppointment = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 1 * 60 * 1000);

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinutesAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });
  const unPaidAppointmentIds = unPaidAppointments.map((appointment) => appointment.id);

  const result = await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: unPaidAppointmentIds,
        },
      },
    });

    await tx.appointment.deleteMany({
      where: {
        id: {
          in: unPaidAppointmentIds,
        },
      },
    });

    for (const appointment of unPaidAppointments) {
      await tx.doctorSchedules.updateMany({
        where: {
          doctorId: appointment.doctorId,
          scheduleId: appointment.scheduleId,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const appointmentService = {
  createAppointmentIntoDb,
  getAllFromDb,
  getMyAppointment,
  changeAppointmentStatus,
  cancelUnpaidAppointment,
};
