import { UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
