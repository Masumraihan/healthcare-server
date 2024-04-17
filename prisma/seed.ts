import { UserRole } from "@prisma/client";
import prisma from "../src/shared/prisma";
import bcrypt from "bcrypt";

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    const hashedPassword = await bcrypt.hash("123456", 12);
    if (isSuperAdminExist) {
      console.log("Super admin already exist");
    } else {
      const superAdminData = await prisma.user.create({
        data: {
          email: "super@admin.com",
          password: hashedPassword,
          role: UserRole.SUPER_ADMIN,
          admin: {
            create: {
              name: "Super Admin",
              // don't need email because in provide in user create line 18. The main reason is that the relation was created with email
              contactNumber: "01999999999",
            },
          },
        },
      });
      console.log(superAdminData);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};
seedSuperAdmin();
