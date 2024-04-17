import { PaymentStatus, UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../../shared/prisma";

const fetchDashboardMetaData = async (user: JwtPayload) => {
  let metaData;
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      metaData = getSuperAdminMeTaData();
      break;
    case UserRole.ADMIN:
      metaData = getAdminMeTaData();
      break;
    case UserRole.DOCTOR:
      metaData = getDoctorMeTaData(user);
      break;
    case UserRole.PATIENT:
      metaData = getPatientMeTaData(user);
      break;
    default:
      throw new Error("Invalid role");
  }

  return metaData;
};

const getSuperAdminMeTaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const adminCount = await prisma.admin.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();
  return {
    appointmentCount,
    adminCount,
    doctorCount,
    patientCount,
    paymentCount,
    totalRevenue,
    barChartData,
    pieChartData,
  };
};
const getAdminMeTaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const doctorCount = await prisma.doctor.count();
  const patientCount = await prisma.patient.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.PAID,
    },
  });
  const barChartData = await getBarChartData();
  const pieChartData = await getPieChartData();
  return {
    appointmentCount,
    doctorCount,
    patientCount,
    paymentCount,
    totalRevenue,
    barChartData,
    pieChartData,
  };
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
      status: PaymentStatus.PAID,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: "status",
    _count: {
      id: true,
    },
    where: {
      doctorId: doctorData.id,
    },
  });
  const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: _count.id,
    }),
  );
  return {
    appointmentCount,
    patientCount: patientCount.length,
    reviewCount,
    totalRevenue,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};

const getPatientMeTaData = async (user: JwtPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });
  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  const appointmentStatusDistribution = await prisma.appointment.groupBy({
    by: "status",
    _count: {
      id: true,
    },
    where: {
      patientId: patientData.id,
    },
  });
  const formattedAppointmentStatusDistribution = appointmentStatusDistribution.map(
    ({ status, _count }) => ({
      status,
      count: _count.id,
    }),
  );

  return {
    appointmentCount,
    prescriptionCount,
    appointmentStatusDistribution: formattedAppointmentStatusDistribution,
  };
};

const getBarChartData = async () => {
  const appointmentCountByMonth: { month: Date; count: bigint }[] = await prisma.$queryRaw`
  SELECT DATE_TRUNC('month', "createdAt") AS month,
 CAST(COUNT(*) AS INTEGER) AS count
 FROM "appointments"
 GROUP BY month
 ORDER BY month ASC
`;

  return appointmentCountByMonth;
};

const getPieChartData = async () => {
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
  return formattedAppointmentStatusDistribution;
};

export const metaService = {
  fetchDashboardMetaData,
};
