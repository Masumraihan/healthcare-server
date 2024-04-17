import { UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";

const fetchDashboardMetaData = async (user: JwtPayload) => {
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      getSuperAdminMeTaData();
      break;
    case UserRole.ADMIN:
      getAdminMeTaData();
      break;
    case UserRole.DOCTOR:
      getDoctorMeTaData(user);
      break;
    case UserRole.PATIENT:
      getPatientMeTaData();
      break;
    default:
      throw new Error("Invalid role");
  }
};

const getSuperAdminMeTaData = async () => {};
const getAdminMeTaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
  });
  console.log({
    appointmentCount,
    doctorCount,
    patientCount,
    paymentCount,
    totalRevenue,
  });
};
const getDoctorMeTaData = async (user: JwtPayload) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: {
      patientId: true,
    },
  });
  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: "status",
    _count: {
      id: true,
    },
  });
  const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: _count.id,
    }),
  );
  console.log(formattedAppointmentStatusDistribution);
};

const getPatientMeTaData = async () => {};

export const metaService = {
  fetchDashboardMetaData,
};
