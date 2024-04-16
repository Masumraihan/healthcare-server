import { z } from "zod";

const create = z.object({
  body: z.object({
    appointmentId: z.string(),
    instructions: z.string(),
    followUpDate: z.string().optional(),
  }),
});

export const prescriptionValidations = {
  create,
};
