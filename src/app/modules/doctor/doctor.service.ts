import prisma from "../../../shared/prisma";

const updateIntoDb = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    await transactionClient.doctor.update({
      where: {
        id,
      },
      data: doctorData,
    });

    if (specialties && specialties.length) {
      const deletedSpecialties = specialties.filter((specialty: any) => specialty.isDeleted);
      if (deletedSpecialties.length) {
        for (const specialty of deletedSpecialties) {
          await transactionClient.doctorSpecialties.deleteMany({
            where: {
              specialtiesId: specialty.specialtiesId,
            },
          });
        }

        const createdSpecialties = specialties.filter((specialty: any) => !specialty.isDeleted);
        if (createdSpecialties.length) {
          for (const specialty of createdSpecialties) {
            await transactionClient.doctorSpecialties.create({
              data: {
                doctorId: id,
                specialtiesId: specialty.specialtiesId,
              },
            });
          }
        }
      }
    }

    //for (const specialtyId of specialties) {
    //  const doctorSpecialties = await transactionClient.doctorSpecialties.create({
    //    data: {
    //      doctorId: updatedDoctorData.id,
    //      specialtiesId: specialtyId,
    //    },
    //  });
    //}
  });

  const result = await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });
  return result;
};

export const doctorService = {
  updateIntoDb,
};
