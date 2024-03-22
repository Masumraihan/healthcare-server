import { jwtHelpers } from "../../../helpers/jwtHelpers";
import prisma from "../../../shared/prisma";
import bcrypt from "bcrypt";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(payload.password, userData.password);
  if (!isCorrectPassword) {
    throw new Error("password incorrect");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    "abcdefg",
    "5m",
  );
  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    "abcdefgh",
    "30d",
  );

  return { accessToken, refreshToken, needPasswordChange: true };
};

const refreshToken = async () => {
  console.log("refresh token");
};

export const authServices = {
  loginUser,
  refreshToken,
};
