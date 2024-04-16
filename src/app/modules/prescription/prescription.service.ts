import { AppointmentStatus, PaymentStatus, Prescription, Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { paginationHelper } from "../../../helpers/paginationHelpers";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import {
  prescriptionRelationalFields,
  prescriptionRelationalFieldsMapper,
  prescriptionSearchableFields,
} from "./prescription.constant";

const insertIntoDb = async (user: JwtPayload, payload: Partial<Prescription>) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      doctor: {
        email: user.email,
      },
    },
  });

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate,
    },
  });
  return result;
};

const getAllFromDb = async (query: any, options: IPaginationOptions) => {
  const andConditions: Prisma.PrescriptionWhereInput[] = [];
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterQuery } = query;

  if (searchTerm) {
    andConditions.push({
      OR: prescriptionSearchableFields.map((key) => ({
        [key]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterQuery).length > 0) {
    andConditions.push({
      AND: Object.keys(filterQuery).map((key) => {
        if (prescriptionRelationalFields.includes(key)) {
          return {
            [prescriptionRelationalFieldsMapper[key]]: {
              email: (filterQuery as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equal: (filterQuery as any)[key],
            },
          };
        }
      }),
    });
  }

  const prescriptionWhereInput: Prisma.PrescriptionWhereInput = {
    AND: andConditions,
  };

  const result = await prisma.prescription.findMany({
    where: prescriptionWhereInput,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });
  const total = await prisma.prescription.count();
  const meta = {
    page,
    limit,
    total,
  };
  return { data: result, meta };
};

const myPrescriptions = async (user: JwtPayload, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user.email,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user.email,
      },
    },
  });

  const meta = {
    page,
    limit,
    total,
  };

  return { data: result, meta };
};

export const prescriptionService = {
  insertIntoDb,
  getAllFromDb,
  myPrescriptions,
};
