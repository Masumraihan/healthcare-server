import { UserRole } from "@prisma/client";

// NOTE: this type just created but not used, use other type called JwtPayload from jwt 
export type IAuthUser = {
  email: string;
  role: UserRole;
} | null;
