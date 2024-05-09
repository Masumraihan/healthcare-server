import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Prisma, Review } from "@prisma/client";
import { IPaginationOptions } from "../../interfaces/pagination";
import { reviewRelationalFields, reviewRelationalFieldsMapper } from "./review.constant";
import { paginationHelper } from "../../../helpers/paginationHelpers";

const insertIntoDb = async (user: JwtPayload, payload: Partial<Review>) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (patientData.id !== appointmentData.patientId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "This is not your appointment");
  }

  const result = await prisma.$transaction(async (tx) => {
    const reviewData = await prisma.review.create({
      data: {
        patientId: patientData.id,
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        rating: payload.rating as number,
        comment: payload.comment as string,
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    const doctorAverageRating = await prisma.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId,
      },
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId,
      },
      data: {
        averageRating: doctorAverageRating._avg?.rating as number,
      },
    });
    return reviewData;
  });

  return result;
};

const getAllFromDb = async (filter: any, option: IPaginationOptions) => {
  const andConditions: Prisma.ReviewWhereInput[] = [];
  const { sortBy, sortOrder, limit, page, skip } = paginationHelper.calculatePagination(option);

  if (Object.keys(filter).length > 0) {
    andConditions.push({
      AND: Object.keys(filter).map((key) => {
        if (reviewRelationalFields.includes(key)) {
          return {
            [reviewRelationalFieldsMapper[key]]: {
              email: (filter as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equal: (filter as any)[key],
            },
          };
        }
      }),
    });
  }

  const reviewWhereCondition: Prisma.ReviewWhereInput = {
    AND: andConditions,
  };

  const result = await prisma.review.findMany({
    where: reviewWhereCondition,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      patient: true,
      doctor: true,
    },
  });

  const total = await prisma.review.count({
    where: reviewWhereCondition,
  });

  return { data: result, meta: { total, page, limit } };
};

export const reviewService = {
  insertIntoDb,
  getAllFromDb,
};
