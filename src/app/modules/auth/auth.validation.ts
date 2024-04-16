import { z } from "zod";

const login = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Please provide a valid Email" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});


const changePassword = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: "Old password is required" }),
    newPassword: z.string({ required_error: "New password is required" }),
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Please provide a valid Email" }),
  }),
});

const resetPassword = z.object({
  body: z.object({
    token: z.string({ required_error: "Token is required" }),
    password: z.string({ required_error: "Password is required" }),
  }),
});

export const authValidations = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};
