export const reviewFilterableFields = ["patientEmail", "doctorEmail"];
export const reviewRelationalFields = ["patientEmail", "doctorEmail"];
export const reviewRelationalFieldsMapper: { [key: string]: string } = {
  patientEmail: "patient",
  doctorEmail: "doctor",
};
