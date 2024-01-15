import mongoose from "mongoose";
import { Review } from "../review/review.model";
import { TCourse } from "./course.interface";
import { Course } from "./course.model";
import AppError from "../../errors/AppError";
import { BAD_REQUEST } from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { Category } from "../category/category.model";
import QueryBuilder from "../../builder/QueryBuilder";

const createCourseIntoDB = async (userData:JwtPayload,payload: TCourse) => {
  if (payload.durationInWeeks) {
    throw new AppError(BAD_REQUEST, "Duration week should not provide",'data');
  }

  
  const findCategoryInfo = await Category.findOne({_id:payload.categoryId});
  
  if(!findCategoryInfo){
    throw new AppError(BAD_REQUEST, "Category Not Found",'data');

  }


  
  const startDate: Date = new Date(payload.startDate);
  const endDate: Date = new Date(payload.endDate);

  const timeDifference: number = endDate.getTime() - startDate.getTime();

  const weeksDifference: number = timeDifference / (1000 * 60 * 60 * 24 * 7);
  payload.durationInWeeks = Math.ceil(weeksDifference);

  const result = (await Course.create({...payload,createdBy:userData._id})).populate('createdBy');

  return result;
};

const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
 
  const courseSearchableFields = ["title", "instructor"];


  const courseQuery = new QueryBuilder(
    Course.find()
      // .populate('createdBy')
     ,
    query,
  )
    .search(courseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await courseQuery.countTotal();
  const courses = await courseQuery.modelQuery;

  return {
    meta,
    courses,
  };
};

const getAllBestReviewCoursesFromDB = async (
  query: Record<string, unknown>
) => {
  const result = await Review.aggregate([
    {
      $group: {
        _id: "$courseId",

        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
    {
      $sort: { averageRating: -1 },
    },
    {
      $limit: 1,
    },

    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $project: {
        course: { $arrayElemAt: ["$course", 0] },
        averageRating: 1,
        reviewCount: 1,
        _id: 0,
      },
    },
  ]);

  let modifiedResult = [];

  if (result.length > 0) {
    modifiedResult = await result[0];
  }

  return modifiedResult;
};

const getSingleCourseFromDB = async (id: string) => {
  const courseId = new mongoose.Types.ObjectId(id);
  const reviewByCourseId = await Review.find({
    courseId: courseId,
  }).populate('createdBy').select({ _id: 0, __v: 0 });

  const result = await Course.findById(id);

  if(!result){
    throw new AppError(BAD_REQUEST, "Course Not Found",'data');

  }

  let modifiedResult = null;

  if (result) {
    modifiedResult = await result.toObject();
  }

  return { ...modifiedResult, reviews: reviewByCourseId };
};


const updateCourseIntoDB = async (id: string, payload: Partial<TCourse>) => {
  const { tags, details, durationInWeeks, ...restPrimitiveFields } = payload;

  if (durationInWeeks) {
    throw new AppError(BAD_REQUEST, "Duration week should not provide",'data');
  }

  const findCourseInfo = await Course.findById(id);
  if(!findCourseInfo){
    throw new AppError(BAD_REQUEST, "Course Not Found",'data');

  }

  const modifiedFields: Record<string, unknown> = { ...restPrimitiveFields };
  if (payload?.startDate !== undefined || payload?.endDate !== undefined) {
    const getCourse = await Course.findById(id);

    const startDate: Date = new Date(
      payload!.startDate ?? getCourse?.startDate!
    );
    const endDate: Date = new Date(payload!.endDate ?? getCourse?.endDate!);

    const timeDifference: number = endDate.getTime() - startDate.getTime();
    const weeksDifference: number = timeDifference / (1000 * 60 * 60 * 24 * 7);
    modifiedFields.durationInWeeks = Math.ceil(weeksDifference);
  }

  if (tags && tags.length > 0) {
    const deleteTags = tags
      .filter((el) => el.name && el.isDeleted)
      .map((el) => el.name);

    if (deleteTags.length > 0) {
      const deletedCourseTags = await Course.findByIdAndUpdate(
        id,
        {
          $pull: { tags: { name: { $in: deleteTags } } },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    const addedTags = tags.filter((el) => el.name && !el.isDeleted);

    if (addedTags.length > 0) {

      const addedCourseTags = await Course.findByIdAndUpdate(
        id,
        {
          $addToSet: { tags: { $each: [...addedTags] } },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }
  }

  if (details && Object.keys(details).length) {
    for (const [key, value] of Object.entries(details)) {
      modifiedFields[`details.${key}`] = value;
    }
  }
  const result = await Course.findByIdAndUpdate(
    id,
    { ...modifiedFields },
    { new: true }
  ).populate('createdBy');

  return result;
};
export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getAllBestReviewCoursesFromDB,
  getSingleCourseFromDB,
  updateCourseIntoDB,
};
