export type IPaymentData = {
  transactionId: string;
  amount: number;
  name: string;
  email: string;
  address: string | null;
  contactNumber: string | null;
};
