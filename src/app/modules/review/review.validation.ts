import { z } from "zod";

const create = z.object({
  body: z.object({
    appointmentId: z.string(),
    rating: z.number(),
    comment: z.string().optional(),
  }),
});

export const reviewValidation = {
  create,
};
