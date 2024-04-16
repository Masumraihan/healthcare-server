export const prescriptionFilterableFields = [
  "searchTerm",
  "patientEmail",
  "doctorEmail",
  "followUpDate",
];

export const prescriptionSearchableFields = ["instructions"];

export const prescriptionRelationalFields = ["patientEmail", "doctorEmail"];

export const prescriptionRelationalFieldsMapper: { [key: string]: string } = {
  patientEmail: "patient",
  doctorEmail: "doctor",
};
