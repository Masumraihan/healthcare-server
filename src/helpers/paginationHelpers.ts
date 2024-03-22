import { IPaginationOptions } from "../app/interface/pagination";

//type IOption = {
//  page?: string;
//  limit?: string;
//  sortBy?: string;
//  sortOrder?: string;
//};

type IOptionResult = {
  page: number;
  skip: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
};

const calculatePagination = (option: IPaginationOptions): IOptionResult => {
  const page = Number(option.page) || 1;
  const limit = Number(option.limit) || 10;
  const skip = (page - 1) * limit;
  const sortBy = option.sortBy || "createdAt";
  const sortOrder = option.sortOrder || "desc";

  return {
    page,
    skip,
    limit,
    sortBy,
    sortOrder,
  };
};
export const paginationHelper = {
  calculatePagination,
};
