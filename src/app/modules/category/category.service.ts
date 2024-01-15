import { JwtPayload } from "jsonwebtoken";
import { TCategory } from "./category.interface";
import { Category } from "./category.model";

const createCategoryIntoDB = async (userData:JwtPayload,payload: TCategory) => {


  const result = await Category.create({...payload,createdBy:userData._id});

  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await Category.find().populate('createdBy');

  return result;
};

const getSingleCategoryFromDB = async (id: string) => {
  const result = await Category.findById(id);

  return result;
};

const deleteCategoryIntoDB = async (id: string) => {
  const result = await Category.findByIdAndUpdate(
    id,
    { isDelete: true },
    { new: true }
  );

  return result;
};

const updateCategoryIntoDB = async (
  id: string,
  payload: Partial<TCategory>
) => {
  const result = await Category.findByIdAndUpdate(id, payload);

  return result;
};
export const CategoryServices = {
  createCategoryIntoDB,
  getAllCategoriesFromDB,
  getSingleCategoryFromDB,
  deleteCategoryIntoDB,
  updateCategoryIntoDB,
};
