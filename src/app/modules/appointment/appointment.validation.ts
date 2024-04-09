import { z } from "zod";

const create = z.object({
  body: z.object({
    doctorId: z.string(),
    scheduleId: z.string(),
  }),
});

export const appointmentValidation = {
  create,
};
