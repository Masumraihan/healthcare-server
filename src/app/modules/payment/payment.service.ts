import { PaymentStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { sslService } from "../SSL/ssl.service";

const initPayment = async (paymentId: string) => {
  const paymentData = await prisma.payment.findUniqueOrThrow({
    where: {
      id: paymentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  const initPaymentData = {
    transactionId: paymentData.transactionId,
    amount: paymentData.amount,
    name: paymentData.appointment.patient.name,
    email: paymentData.appointment.patient.email,
    address: paymentData.appointment.patient.address,
    contactNumber: paymentData.appointment.patient.contactNumber,
  };

  const result = await sslService.initPayment(initPaymentData);

  return { paymentUrl: result.GatewayPageURL };
};

const validatePayment = async (payload: any) => {
  //if (!payload || payload.status !== "VALID") {
  //  return { message: "Invalid payment data" };
  //}

  //const response = await sslService.validatePayment(payload);

  //if (response.status !== "VALID") {
  //  return { message: "Payment failed" };
  //}

  // TEMP RESPONSE FOR CHECKING SSL INTEGRATION
  const response = payload;

  await prisma.$transaction(async (tx) => {
    const paymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });

    await tx.appointment.update({
      where: {
        id: paymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });
  return { message: "Payment successful" };
};

export const paymentService = { initPayment, validatePayment };
