import { BAD_REQUEST } from "http-status";
import { Course } from "../course/course.model";
import { TRating } from "./review.interface";
import { Review } from "./review.model";
import AppError from "../../errors/AppError";
import { JwtPayload } from "jsonwebtoken";

const createReviewIntoDB = async (userData:JwtPayload,payload: TRating) => {


  const findCourseInfo = await Course.findById(payload.courseId);
  
  if(!findCourseInfo){
    throw new AppError(BAD_REQUEST, "Course Not Found",'data');

  }
  const result = (await Review.create({...payload,createdBy:userData._id})).populate('createdBy');

  return result;
};

const getAllReviewsFromDB = async (query: Record<string, unknown>) => {
  const result = await Review.find();

  return result;
};

const getSingleReviewFromDB = async (id: string) => {
  const result = await Review.findById(id);

  return result;
};


const updateReviewIntoDB = async (id: string, payload: Partial<TRating>) => {
  const result = await Review.findByIdAndUpdate(id, payload);

  return result;
};
export const ReviewServices = {
  createReviewIntoDB,
  getAllReviewsFromDB,
  getSingleReviewFromDB,
  updateReviewIntoDB,
};
