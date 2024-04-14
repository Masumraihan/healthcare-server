import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { Review } from "@prisma/client";

const insertIntoDb = async (user: JwtPayload, payload: Partial<Review>) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
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
        averageRating: (doctorAverageRating._avg?.rating as number) || 0.0, // 0.0 as default averageRating
      },
    });
    return reviewData;
  });

  return result;
};

export const reviewService = {
  insertIntoDb,
};
